import { NextRequest, NextResponse } from "next/server";
import { normalizeAnswers, buildSubmissionPayload } from "../../../../features/repairability/lib/normalize-submission";
import {
  buildAcceptancePageHtml,
  buildRefusalPageHtml,
} from "../../../../features/repairability/lib/acceptance-page-html";
import { isCareAccepted } from "../../../../features/repairability/lib/decision";
import {
  validatePreviewSubmission,
  validateSubmission,
} from "../../../../features/repairability/schema/submission-schema";
import { buildWebhookRequest } from "../../../../features/repairability/schema/webhook-contract";
import { computeRepairabilityScore } from "../../../../features/repairability/scoring/repairability-score";
import type { ScoreResponse } from "../../../../features/repairability/types";
import { getIntakeConfig } from "../../../../features/repairability/lib/intake-status";

interface WebhookDelivery {
  delivered: boolean;
  result: ScoreResponse | null;
  acceptancePageHtml: string | null;
  refusalPageHtml: string | null;
}

async function postToWebhook(payload: unknown): Promise<WebhookDelivery> {
  const webhookUrl = process.env.REPAIRABILITY_WEBHOOK_URL;
  if (!webhookUrl) return { delivered: false, result: null, acceptancePageHtml: null, refusalPageHtml: null };

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.REPAIRABILITY_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.REPAIRABILITY_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { delivered: false, result: null, acceptancePageHtml: null, refusalPageHtml: null };
  }

  if (!response.ok) {
    return { delivered: false, result: null, acceptancePageHtml: null, refusalPageHtml: null };
  }

  const contentType = response.headers.get("content-type") ?? "";
  const responseText = await response.text();
  if (contentType.includes("text/html")) {
    return { delivered: true, result: null, acceptancePageHtml: responseText, refusalPageHtml: null };
  }

  try {
    const parsed = JSON.parse(responseText) as Partial<ScoreResponse>;
    const acceptancePageHtml = typeof parsed.acceptancePageHtml === "string" ? parsed.acceptancePageHtml : null;
    const refusalPageHtml = typeof parsed.refusalPageHtml === "string" ? parsed.refusalPageHtml : null;
    if (typeof parsed.repairabilityScore === "number" && typeof parsed.recommendedNextStep === "string") {
      return { delivered: true, result: parsed as ScoreResponse, acceptancePageHtml, refusalPageHtml };
    }
  } catch {
    return { delivered: true, result: null, acceptancePageHtml: null, refusalPageHtml: null };
  }

  return { delivered: true, result: null, acceptancePageHtml: null, refusalPageHtml: null };
}

export async function POST(request: NextRequest) {
  try {
    const intake = getIntakeConfig();
    if (!intake.isOpen) {
      return NextResponse.json(
        { error: intake.title, details: [intake.message], intakeStatus: intake.status },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { answers?: Record<string, unknown> };
    const answers = normalizeAnswers(body.answers ?? {});
    const previewValidation = validatePreviewSubmission(answers);
    if (!previewValidation.isValid) {
      return NextResponse.json({ error: "Validation echouee", details: previewValidation.errors }, { status: 400 });
    }

    const payload = buildSubmissionPayload(answers, {
      locale: request.headers.get("accept-language") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      formVersion: "1.0.0",
    });

    const localScore = computeRepairabilityScore({
      answers: payload.answers,
      riskFlags: payload.derivedFacts.riskFlags,
    });
    if (isCareAccepted(localScore)) {
      const validation = validateSubmission(answers);
      if (!validation.isValid) {
        return NextResponse.json({ error: "Validation echouee", details: validation.errors }, { status: 400 });
      }
    }

    const webhookRequest = buildWebhookRequest(payload, localScore);
    const webhookDelivery = await postToWebhook(webhookRequest);
    const result = webhookDelivery.result ?? localScore;
    const accepted = isCareAccepted(result);
    const acceptancePageHtml = accepted
      ? webhookDelivery.acceptancePageHtml ??
        buildAcceptancePageHtml({
          payload,
          result,
          depositAddress: process.env.REPAIRABILITY_DROP_OFF_ADDRESS,
        })
      : undefined;
    const refusalPageHtml = !accepted
      ? webhookDelivery.refusalPageHtml ??
        buildRefusalPageHtml({
          payload,
          result,
        })
      : undefined;
    const resultWithDecisionPage =
      acceptancePageHtml || refusalPageHtml ? { ...result, acceptancePageHtml, refusalPageHtml } : result;

    return NextResponse.json({
      payload,
      result: resultWithDecisionPage,
      acceptancePageHtml,
      refusalPageHtml,
      source: webhookDelivery.result
        ? "webhook"
        : webhookDelivery.delivered
          ? "webhook_sent_local_fallback"
          : "local_fallback",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne lors de la soumission", details: (error as Error).message },
      { status: 500 },
    );
  }
}

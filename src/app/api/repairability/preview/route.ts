import { NextRequest, NextResponse } from "next/server";
import { normalizeAnswers, buildSubmissionPayload } from "../../../../features/repairability/lib/normalize-submission";
import { getIntakeConfig } from "../../../../features/repairability/lib/intake-status";
import { validatePreviewSubmission } from "../../../../features/repairability/schema/submission-schema";
import { computeRepairabilityScore } from "../../../../features/repairability/scoring/repairability-score";

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
    const validation = validatePreviewSubmission(answers);
    if (!validation.isValid) {
      return NextResponse.json({ error: "Validation echouee", details: validation.errors }, { status: 400 });
    }

    const payload = buildSubmissionPayload(answers, {
      locale: request.headers.get("accept-language") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      formVersion: "1.0.0",
    });

    const result = computeRepairabilityScore({
      answers: payload.answers,
      riskFlags: payload.derivedFacts.riskFlags,
    });

    return NextResponse.json({
      payload,
      result,
      source: "local_preview",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne lors du calcul intermediaire", details: (error as Error).message },
      { status: 500 },
    );
  }
}

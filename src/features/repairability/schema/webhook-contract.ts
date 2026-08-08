import type { ScoreResponse, SubmissionPayload } from "../types";

export interface WebhookRequestContract {
  event: "repairability_submission";
  version: "1.0.0";
  payload: SubmissionPayload;
  score: ScoreResponse;
  depositInstructions: {
    location: string;
    shelf: string;
    lockCode: string;
  };
}

export interface WebhookResponseContract extends ScoreResponse {
  requestId?: string;
  processingMs?: number;
  acceptancePageHtml?: string;
  refusalPageHtml?: string;
}

export function buildWebhookRequest(
  payload: SubmissionPayload,
  score: ScoreResponse,
  depositInstructions: WebhookRequestContract["depositInstructions"],
): WebhookRequestContract {
  return {
    event: "repairability_submission",
    version: "1.0.0",
    payload,
    score,
    depositInstructions,
  };
}

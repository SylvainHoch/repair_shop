import type { ScoreResponse } from "../types";

export function isCareAccepted(result: ScoreResponse): boolean {
  return (
    result.repairabilityScore >= 30 &&
    result.recommendedNextStep !== "professionnel_recommande" &&
    result.recommendedNextStep !== "non_recommande"
  );
}

export function requiresContactBeforeSubmit(result?: ScoreResponse): boolean {
  return result ? isCareAccepted(result) : true;
}

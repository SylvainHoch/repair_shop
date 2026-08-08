import type { RepairabilityAnswers, ScoreResponse } from "../types";
import { isSystematicallyRefusedObjectType, systematicallyRefusedObjectLabels } from "../config/refused-objects";

interface ScoreInputs {
  answers: RepairabilityAnswers;
  riskFlags: string[];
}

function bounded(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function computeRepairabilityScore({ answers, riskFlags }: ScoreInputs): ScoreResponse {
  const isRefusedObjectType = isSystematicallyRefusedObjectType(answers.objectType);
  const refusedObjectLabel = isRefusedObjectType
    ? systematicallyRefusedObjectLabels[answers.objectType as keyof typeof systematicallyRefusedObjectLabels]
    : undefined;

  let identificationScore = 0;
  if (answers.objectType) identificationScore += 6;
  if (answers.brand) identificationScore += 5;
  if (answers.model) identificationScore += 4;
  identificationScore = bounded(identificationScore, 0, 15);

  let diagnosticClarityScore = 0;
  if (answers.mainSymptom) diagnosticClarityScore += 12;
  if (answers.failureWhen) diagnosticClarityScore += 5;
  if (answers.secondarySymptoms && answers.secondarySymptoms.length > 0) diagnosticClarityScore += 5;
  diagnosticClarityScore = bounded(diagnosticClarityScore, 0, 20);

  let safetyScore = 20;
  if (riskFlags.includes("smoke_detected")) safetyScore -= 3;
  if (riskFlags.includes("burn_smell_detected")) safetyScore -= 6;
  if (riskFlags.includes("liquid_leak_detected")) safetyScore -= 6;
  if (riskFlags.includes("mechanical_risk_detected")) safetyScore -= 2;
  if (riskFlags.includes("cable_damage_detected")) safetyScore -= 0;
  safetyScore = bounded(safetyScore, 0, 20);

  let partsScore = 0;
  if (answers.replacementPartAvailability === "facile") partsScore = 15;
  if (answers.replacementPartAvailability === "possible") partsScore = 10;
  if (answers.replacementPartAvailability === "difficile") partsScore = 4;
  if (answers.replacementPartAvailability === "inconnue") partsScore = 6;

  const workshopHandlingScore = 20;
  const freeServiceScore = 10;

  const subScores = {
    identificationScore,
    diagnosticClarityScore,
    safetyScore,
    partsScore,
    workshopHandlingScore,
    freeServiceScore,
  };

  let repairabilityScore = Object.values(subScores).reduce((sum, score) => sum + score, 0);
  const highRisk = riskFlags.length >= 3 || safetyScore <= 8;
  if (highRisk) repairabilityScore = Math.min(repairabilityScore, 55);
  if (isRefusedObjectType) repairabilityScore = Math.min(repairabilityScore, 20);

  let confidenceScore = 60;
  if (answers.model) confidenceScore += 10;
  if (answers.secondarySymptoms && answers.secondarySymptoms.length > 0) confidenceScore += 10;
  if (answers.replacementPartAvailability && answers.replacementPartAvailability !== "inconnue") confidenceScore += 10;
  if (!answers.objectType || !answers.mainSymptom) confidenceScore -= 20;
  confidenceScore = bounded(confidenceScore);

  const riskLevel = highRisk ? "high" : isRefusedObjectType || safetyScore < 14 ? "medium" : "low";

  let recommendedNextStep: ScoreResponse["recommendedNextStep"] = "diagnostic_complementaire";
  if (isRefusedObjectType) recommendedNextStep = "non_recommande";
  else if (repairabilityScore >= 70) recommendedNextStep = "reparable_soi_meme";
  else if (repairabilityScore < 35) recommendedNextStep = "non_recommande";

  const repairComplexity: ScoreResponse["repairComplexity"] =
    highRisk || isRefusedObjectType
      ? "elevee"
      : repairabilityScore >= 70
        ? "facile"
        : repairabilityScore >= 45
          ? "moderee"
          : "elevee";

  const explanations = [
    ...(isRefusedObjectType && refusedObjectLabel
      ? [`Objet refusé systématiquement : ${refusedObjectLabel}.`]
      : []),
    `Identification produit: ${identificationScore}/15`,
    `Clarté du diagnostic : ${diagnosticClarityScore}/20`,
    `Contrainte de sécurité : ${safetyScore}/20`,
    "Démontage et intervention gérés par l'atelier.",
    isRefusedObjectType
      ? "Cette famille d'objet sort du périmètre de prise en charge."
      : highRisk
        ? "Un risque élevé est signalé pour préparer une prise en charge sécurisée."
        : "Aucun risque critique détecté.",
  ];

  const likelyFaultAreas = [
    answers.mainSymptom ?? "a_preciser",
    ...(answers.secondarySymptoms ?? []).slice(0, 2),
  ];

  return {
    repairabilityScore: bounded(repairabilityScore),
    confidenceScore,
    riskLevel,
    likelyFaultAreas,
    recommendedNextStep,
    repairComplexity,
    explanations,
    partsToCheck: answers.visibleDamage ?? [],
    humanReviewSuggested: confidenceScore < 50 || riskLevel === "high" || isRefusedObjectType,
    subScores,
  };
}

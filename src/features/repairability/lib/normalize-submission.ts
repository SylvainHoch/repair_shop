import type { DerivedFacts, RepairabilityAnswers, SubmissionPayload } from "../types";

function normalizeBoolean(input: unknown): boolean | undefined {
  if (typeof input === "boolean") return input;
  if (typeof input === "string") {
    if (input === "true" || input === "oui") return true;
    if (input === "false" || input === "non") return false;
  }
  return undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string" && value.trim() !== "") return [value];
  return [];
}

export function normalizeAnswers(raw: Record<string, unknown>): RepairabilityAnswers {
  const answers: RepairabilityAnswers = {
    ...raw,
    firstName: typeof raw.firstName === "string" ? raw.firstName.trim() : undefined,
    email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : undefined,
    objectDescription: typeof raw.objectDescription === "string" ? raw.objectDescription.trim() : undefined,
    brand: typeof raw.brand === "string" ? raw.brand.trim() : undefined,
    model: typeof raw.model === "string" ? raw.model.trim() : undefined,
    estimatedAgeYears:
      typeof raw.estimatedAgeYears === "number"
        ? raw.estimatedAgeYears
        : raw.estimatedAgeYears
          ? Number(raw.estimatedAgeYears)
          : undefined,
    estimatedRepairBudget:
      typeof raw.estimatedRepairBudget === "number"
        ? raw.estimatedRepairBudget
        : raw.estimatedRepairBudget
          ? Number(raw.estimatedRepairBudget)
          : undefined,
    recentMaintenance: normalizeStringArray(raw.recentMaintenance),
    secondarySymptoms: normalizeStringArray(raw.secondarySymptoms),
    visibleDamage: normalizeStringArray(raw.visibleDamage),
    consumablesState: normalizeStringArray(raw.consumablesState),
    toolsAvailable: normalizeStringArray(raw.toolsAvailable),
    documentationFound: normalizeStringArray(raw.documentationFound),
    smokeObserved: normalizeBoolean(raw.smokeObserved),
    burnSmellObserved: normalizeBoolean(raw.burnSmellObserved),
    liquidLeakObserved: normalizeBoolean(raw.liquidLeakObserved),
    electricShockRiskObserved: normalizeBoolean(raw.electricShockRiskObserved),
    batteryDamageObserved: normalizeBoolean(raw.batteryDamageObserved),
    bladeOrMotorSafetyConcern: normalizeBoolean(raw.bladeOrMotorSafetyConcern),
    previousRepairAttempt: normalizeBoolean(raw.previousRepairAttempt),
    replacementPartKnown: normalizeBoolean(raw.replacementPartKnown),
    consent: normalizeBoolean(raw.consent),
    repairAttemptAcknowledgement: normalizeBoolean(raw.repairAttemptAcknowledgement),
    pickupCommitment: normalizeBoolean(raw.pickupCommitment),
  };

  return answers;
}

export function deriveFacts(answers: RepairabilityAnswers): DerivedFacts {
  const riskFlags: string[] = [];
  const coherenceSignals: string[] = [];
  const missingCriticalFields: string[] = [];

  if (answers.smokeObserved) riskFlags.push("smoke_detected");
  if (answers.burnSmellObserved) riskFlags.push("burn_smell_detected");
  if (answers.liquidLeakObserved) riskFlags.push("liquid_leak_detected");
  if (answers.batteryDamageObserved) riskFlags.push("battery_damage_detected");
  if (answers.bladeOrMotorSafetyConcern) riskFlags.push("mechanical_risk_detected");
  if (answers.visibleDamage?.includes("cable")) riskFlags.push("cable_damage_detected");

  if (answers.brand && answers.objectType) coherenceSignals.push("product_identified");
  if (answers.mainSymptom && answers.failureWhen) coherenceSignals.push("failure_pattern_set");
  if (answers.toolsAvailable && answers.toolsAvailable.length > 0) coherenceSignals.push("repair_tools_declared");

  for (const field of ["objectFamily", "objectType", "mainSymptom"]) {
    if (!answers[field]) missingCriticalFields.push(field);
  }

  return {
    normalizedObjectFamily: answers.objectFamily,
    riskFlags,
    coherenceSignals,
    missingCriticalFields,
  };
}

export function buildSubmissionPayload(
  answers: RepairabilityAnswers,
  context: { locale?: string; userAgent?: string; formVersion?: string },
): SubmissionPayload {
  return {
    submissionId: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    answers,
    derivedFacts: deriveFacts(answers),
    clientContext: {
      locale: context.locale,
      userAgent: context.userAgent,
      formVersion: context.formVersion ?? "1.0.0",
    },
    consent: answers.consent === true,
  };
}

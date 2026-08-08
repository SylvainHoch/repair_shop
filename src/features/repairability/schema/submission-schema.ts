import type { RepairabilityAnswers } from "../types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const previewRequiredFields: Array<keyof RepairabilityAnswers> = [
  "objectFamily",
  "objectType",
  "brand",
  "failureWhen",
  "stillPowersOn",
  "mainSymptom",
];

const finalRequiredFields: Array<keyof RepairabilityAnswers> = [
  ...previewRequiredFields,
  "firstName",
  "email",
  "consent",
  "repairAttemptAcknowledgement",
  "pickupCommitment",
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateSubmission(answers: RepairabilityAnswers): ValidationResult {
  const errors: string[] = [];

  for (const field of finalRequiredFields) {
    const value = answers[field];
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      errors.push(`Champ requis manquant: ${String(field)}`);
    }
  }

  if (typeof answers.email === "string" && answers.email.trim() !== "" && !isValidEmail(answers.email.trim())) {
    errors.push("`email` doit être une adresse valide.");
  }

  if (answers.consent !== true) {
    errors.push("Le consentement à l'utilisation des données est obligatoire.");
  }

  if (answers.repairAttemptAcknowledgement !== true) {
    errors.push("L'acceptation des limites de la tentative de réparation est obligatoire.");
  }

  if (answers.pickupCommitment !== true) {
    errors.push("L'engagement de retrait de l'objet est obligatoire.");
  }

  if (typeof answers.estimatedAgeYears === "number" && answers.estimatedAgeYears < 0) {
    errors.push("`estimatedAgeYears` doit être positif.");
  }

  if (typeof answers.estimatedRepairBudget === "number" && answers.estimatedRepairBudget < 0) {
    errors.push("`estimatedRepairBudget` doit être positif.");
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePreviewSubmission(answers: RepairabilityAnswers): ValidationResult {
  const errors: string[] = [];

  for (const field of previewRequiredFields) {
    const value = answers[field];
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      errors.push(`Champ requis manquant: ${String(field)}`);
    }
  }

  if (typeof answers.estimatedAgeYears === "number" && answers.estimatedAgeYears < 0) {
    errors.push("`estimatedAgeYears` doit être positif.");
  }

  if (typeof answers.estimatedRepairBudget === "number" && answers.estimatedRepairBudget < 0) {
    errors.push("`estimatedRepairBudget` doit être positif.");
  }

  return { isValid: errors.length === 0, errors };
}

import { getObjectTypesForFamily } from "../config/object-catalog";
import { repairabilityQuestions } from "../config/question-flow";
import { getMainSymptoms } from "../config/symptom-map";
import type { RepairabilityAnswers } from "../types";

export function buildSubmissionSummary(answers: RepairabilityAnswers): string {
  return repairabilityQuestions.flatMap((question) => {
    const value = answers[question.id];
    if (value === undefined || value === null || value === "" ||
        (Array.isArray(value) && value.length === 0)) return [];

    const options = question.id === "objectType"
      ? getObjectTypesForFamily(answers.objectFamily)
      : question.id === "mainSymptom"
        ? getMainSymptoms(answers.objectType)
        : question.options;
    const formatValue = (item: unknown): string => {
      if (typeof item === "boolean") return item ? "Oui" : "Non";
      const text = String(item);
      return options?.find((option) => option.value === text)?.label ?? text;
    };
    const text = Array.isArray(value) ? value.map(formatValue).join(", ") : formatValue(value);
    return [`${question.label} : ${text}`];
  }).join("\n");
}

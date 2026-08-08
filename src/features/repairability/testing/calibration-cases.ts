import type { RepairabilityAnswers } from "../types";

export interface CalibrationCase {
  id: string;
  label: string;
  answers: RepairabilityAnswers;
  expected: {
    minScore: number;
    maxScore: number;
    expectedRisk: "low" | "medium" | "high";
  };
}

export const calibrationCases: CalibrationCase[] = [
  {
    id: "easy-filter-aspirateur",
    label: "Aspirateur - filtre bouche, faible risque",
    answers: {
      objectFamily: "entretien",
      objectType: "aspirateur",
      brand: "Rowenta",
      model: "RO1234",
      failureWhen: "progressif",
      stillPowersOn: "oui",
      mainSymptom: "aspiration_faible",
      secondarySymptoms: ["bruit_anormal"],
      canOpenDevice: "oui",
      toolsAvailable: ["tournevis"],
      comfortLevel: "intermediaire",
      replacementPartAvailability: "facile",
      consent: true,
    },
    expected: { minScore: 65, maxScore: 90, expectedRisk: "low" },
  },
  {
    id: "medium-pompe-cafetiere",
    label: "Cafetiere - pompe faible, risque modere",
    answers: {
      objectFamily: "cuisine",
      objectType: "cafetiere",
      brand: "Philips",
      failureWhen: "intermittent",
      stillPowersOn: "oui",
      mainSymptom: "pas_ecoulement",
      secondarySymptoms: ["voyant_erreur"],
      liquidLeakObserved: true,
      canOpenDevice: "incertain",
      toolsAvailable: ["tournevis", "multimetre"],
      comfortLevel: "debutant",
      replacementPartAvailability: "possible",
      consent: true,
    },
    expected: { minScore: 40, maxScore: 70, expectedRisk: "medium" },
  },
  {
    id: "high-risk-taille-haie",
    label: "Outil électrique — odeur de brûlé et risque mécanique",
    answers: {
      objectFamily: "bricolage",
      objectType: "outil_electrique",
      brand: "Bosch",
      failureWhen: "brutal",
      stillPowersOn: "parfois",
      mainSymptom: "moteur_faible",
      burnSmellObserved: true,
      smokeObserved: true,
      bladeOrMotorSafetyConcern: true,
      canOpenDevice: "non",
      toolsAvailable: ["aucun"],
      comfortLevel: "debutant",
      replacementPartAvailability: "difficile",
      consent: true,
    },
    expected: { minScore: 10, maxScore: 55, expectedRisk: "high" },
  },
];

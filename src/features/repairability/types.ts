export const objectFamilyValues = [
  "cuisine",
  "entretien",
  "bricolage",
  "confort",
  "audio_video",
  "telephonie",
  "loisirs",
  "photo_musique",
  "objets_non_electriques",
] as const;

export type ObjectFamily = (typeof objectFamilyValues)[number];

export type Recommendation =
  | "reparable_soi_meme"
  | "diagnostic_complementaire"
  | "professionnel_recommande"
  | "non_recommande";

export type RiskLevel = "low" | "medium" | "high";

export type QuestionType =
  | "text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "boolean"
  | "textarea";

export interface SelectOption {
  value: string;
  label: string;
}

export interface QuestionCondition {
  field: string;
  equals?: string | number | boolean;
  in?: Array<string | number | boolean>;
  notEquals?: string | number | boolean;
}

export interface FormQuestion {
  id: string;
  step: number;
  type: QuestionType;
  label: string;
  helpText?: string;
  options?: SelectOption[];
  visibleWhen?: QuestionCondition[];
  requiredWhen?: QuestionCondition[];
  mapsToWebhookField: string;
}

export interface ApplianceType {
  family: ObjectFamily;
  value: string;
  label: string;
}

export interface RepairabilityAnswers {
  objectFamily?: ObjectFamily;
  objectType?: string;
  objectDescription?: string;
  firstName?: string;
  email?: string;
  brand?: string;
  model?: string;
  serialOrReference?: string;
  estimatedAgeYears?: number;
  purchasePriceRange?: string;
  usageFrequency?: string;
  powerType?: string;
  failureWhen?: string;
  firstSeenAt?: string;
  circumstances?: string;
  stillPowersOn?: string;
  recentMaintenance?: string[];
  previousRepairAttempt?: boolean;
  previousRepairAttemptDetails?: string;
  mainSymptom?: string;
  secondarySymptoms?: string[];
  visibleDamage?: string[];
  consumablesState?: string[];
  electricShockRiskObserved?: boolean;
  burnSmellObserved?: boolean;
  smokeObserved?: boolean;
  liquidLeakObserved?: boolean;
  batteryDamageObserved?: boolean;
  bladeOrMotorSafetyConcern?: boolean;
  canOpenDevice?: string;
  screwTypeKnown?: string;
  toolsAvailable?: string[];
  comfortLevel?: string;
  replacementPartKnown?: boolean;
  replacementPartAvailability?: string;
  documentationFound?: string[];
  estimatedRepairBudget?: number;
  willingnessToRepair?: string;
  urgency?: string;
  sentimentalOrEcologicalPriority?: boolean;
  consent?: boolean;
  repairAttemptAcknowledgement?: boolean;
  pickupCommitment?: boolean;
  [key: string]: unknown;
}

export interface DerivedFacts {
  normalizedObjectFamily?: ObjectFamily;
  riskFlags: string[];
  coherenceSignals: string[];
  missingCriticalFields: string[];
}

export interface SubmissionPayload {
  submissionId: string;
  submittedAt: string;
  answers: RepairabilityAnswers;
  derivedFacts: DerivedFacts;
  clientContext: {
    locale?: string;
    userAgent?: string;
    formVersion: string;
  };
  consent: boolean;
}

export interface ScoreResponse {
  repairabilityScore: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  likelyFaultAreas: string[];
  recommendedNextStep: Recommendation;
  repairComplexity: "facile" | "moderee" | "elevee";
  explanations: string[];
  partsToCheck: string[];
  humanReviewSuggested: boolean;
  subScores?: Record<string, number>;
  acceptancePageHtml?: string;
  refusalPageHtml?: string;
}

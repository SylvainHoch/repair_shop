"use client";

import { useMemo, useState } from "react";
import { getObjectTypesForFamily } from "../config/object-catalog";
import { getQuestionsForStep } from "../config/question-flow";
import { isSystematicallyRefusedObjectType } from "../config/refused-objects";
import { getMainSymptoms } from "../config/symptom-map";
import { isCareAccepted, requiresContactBeforeSubmit } from "../lib/decision";
import type { IntakeConfig } from "../lib/intake-status";
import { validatePreviewSubmission, validateSubmission } from "../schema/submission-schema";
import type { RepairabilityAnswers, ScoreResponse, SubmissionPayload } from "../types";
import { StepRenderer } from "./step-renderer";

const totalSteps = 6;
const stepTitles: Record<number, string> = {
  1: "Identifier l'appareil",
  2: "Qualifier la panne",
  3: "Symptomes observes",
  4: "Verification securite",
  5: "Evaluation intermediaire",
  6: "Contact",
};

interface SubmitState {
  loading: boolean;
  error?: string;
  details?: string[];
  result?: ScoreResponse;
  payload?: SubmissionPayload;
}

const stepRequiredFields: Record<number, string[]> = {
  1: ["objectFamily", "objectType", "brand"],
  2: ["failureWhen", "stillPowersOn", "mainSymptom"],
  3: ["replacementPartAvailability"],
  4: [],
  5: [],
  6: ["firstName", "email", "consent", "repairAttemptAcknowledgement", "pickupCommitment"],
};

const fieldLabels: Record<string, string> = {
  objectFamily: "Famille de l'objet",
  objectType: "Type d'objet",
  objectTypeOther: "Type d'appareil (autre)",
  objectDescription: "Description libre de l'objet",
  firstName: "Prenom",
  email: "Email",
  brand: "Marque",
  failureWhen: "Apparition de la panne",
  stillPowersOn: "Etat d'allumage",
  mainSymptom: "Symptome principal",
  mainSymptomOther: "Description du symptome principal",
  circumstances: "Contexte de la panne",
  circumstancesOther: "Precision du contexte",
  secondarySymptomsOther: "Autres symptomes",
  visibleDamageOther: "Autres dommages visibles",
  replacementPartAvailability: "Disponibilite des pieces",
  consent: "Consentement a l'utilisation des donnees",
  repairAttemptAcknowledgement: "Acceptation des limites de la tentative",
  pickupCommitment: "Engagement de retrait",
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function RepairabilityForm({ intake }: { intake: IntakeConfig }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<RepairabilityAnswers>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ loading: false });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);

  const questions = useMemo(() => getQuestionsForStep(step), [step]);
  const objectTypeOptions = useMemo(() => getObjectTypesForFamily(answers.objectFamily), [answers.objectFamily]);
  const mainSymptomOptions = useMemo(() => getMainSymptoms(answers.objectType), [answers.objectType]);
  const intermediateScore = submitState.result?.repairabilityScore;
  const isRefusedObjectType = isSystematicallyRefusedObjectType(answers.objectType);
  const isRejectedRecommendation =
    submitState.result?.recommendedNextStep === "professionnel_recommande" ||
    submitState.result?.recommendedNextStep === "non_recommande";
  const isAccepted = submitState.result ? isCareAccepted(submitState.result) : false;
  const isSoftAccept = isAccepted && typeof intermediateScore === "number" && intermediateScore < 60;
  const isStrongAccept = isAccepted && typeof intermediateScore === "number" && intermediateScore >= 60;
  const shouldSubmitWithoutContact = submitState.result ? !requiresContactBeforeSubmit(submitState.result) : false;

  function getScoreVerdict(score: number): string {
    if (isRefusedObjectType) return "Pas de prise en charge: ce type d'objet est refusé systématiquement.";
    if (isRejectedRecommendation) return "Pas de prise en charge: ce cas sort du périmètre de réparation.";
    if (score < 30) return "Pas de prise en charge: trop peu de chances que la réparation aboutisse.";
    if (score < 60) return "Prise en charge possible: je peux recevoir tes coordonnées, avec une probabilité de réussite faible.";
    return "Prise en charge OK.";
  }

  function updateAnswer(id: string, value: unknown) {
    setFieldErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      if (id === "objectFamily") {
        delete next.objectType;
        delete next.objectTypeOther;
        delete next.mainSymptom;
        delete next.mainSymptomOther;
      }
      if (id === "objectType") {
        delete next.mainSymptom;
        delete next.mainSymptomOther;
      }
      return next;
    });
  }

  function addRequiredOtherFieldErrors(nextErrors: Record<string, string>, currentAnswers: RepairabilityAnswers): void {
    if (currentAnswers.objectType === "autre" && !String(currentAnswers.objectTypeOther ?? "").trim()) {
      nextErrors.objectTypeOther = "Merci de preciser le type d'appareil.";
    }
    if (currentAnswers.mainSymptom === "autre" && !String(currentAnswers.mainSymptomOther ?? "").trim()) {
      nextErrors.mainSymptomOther = "Merci de decrire le symptome principal.";
    }
    if (currentAnswers.circumstances === "autre" && !String(currentAnswers.circumstancesOther ?? "").trim()) {
      nextErrors.circumstancesOther = "Merci de preciser les circonstances.";
    }
    if (
      Array.isArray(currentAnswers.secondarySymptoms) &&
      currentAnswers.secondarySymptoms.includes("autre") &&
      !String(currentAnswers.secondarySymptomsOther ?? "").trim()
    ) {
      nextErrors.secondarySymptomsOther = "Merci de decrire les autres symptomes.";
    }
    if (
      Array.isArray(currentAnswers.visibleDamage) &&
      currentAnswers.visibleDamage.includes("autre") &&
      !String(currentAnswers.visibleDamageOther ?? "").trim()
    ) {
      nextErrors.visibleDamageOther = "Merci de preciser les dommages visibles.";
    }
  }

  function scrollToFirstError(nextErrors: Record<string, string>): void {
    const firstErrorField = Object.keys(nextErrors)[0];
    if (!firstErrorField) return;

    requestAnimationFrame(() => {
      const container = document.getElementById(`field-${firstErrorField}`);
      if (!container) return;

      container.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = container.querySelector("input, textarea, button, select") as HTMLElement | null;
      focusable?.focus();
    });
  }

  function validateCurrentStep(): boolean {
    const requiredFields = stepRequiredFields[step] ?? [];
    const nextErrors: Record<string, string> = {};

    for (const field of requiredFields) {
      const value = answers[field];
      if (field === "consent") {
        if (value !== true) {
          nextErrors[field] = "Le consentement est obligatoire pour continuer.";
        }
        continue;
      }

      const isMissing =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);

      if (isMissing) {
        nextErrors[field] = `Le champ "${fieldLabels[field] ?? field}" est obligatoire.`;
      }
    }

    if (step === 6) {
      const emailValue = String(answers.email ?? "").trim();
      if (emailValue && !isValidEmail(emailValue)) {
        nextErrors.email = "Merci de renseigner une adresse email valide.";
      }
    }

    addRequiredOtherFieldErrors(nextErrors, answers);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
    }
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!intake.isOpen) {
      setSubmitState({ loading: false, error: intake.message });
      return;
    }

    const shouldRequireContact = !shouldSubmitWithoutContact;

    if (shouldRequireContact && !validateCurrentStep()) {
      setSubmitState({
        loading: false,
        error: "Certains champs sont incomplets. Corrige les erreurs en rouge avant de soumettre.",
      });
      return;
    }

    const finalValidation = shouldRequireContact ? validateSubmission(answers) : validatePreviewSubmission(answers);
    if (!finalValidation.isValid) {
      setSubmitState({
        loading: false,
        error: "Le formulaire contient des erreurs de validation.",
        details: finalValidation.errors,
      });
      return;
    }

    setSubmitState({ loading: true });
    try {
      const response = await fetch("/api/repairability/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = (await response.json()) as {
        payload?: SubmissionPayload;
        result?: ScoreResponse;
        acceptancePageHtml?: string;
        refusalPageHtml?: string;
        error?: string;
        details?: string[];
      };
      if (!response.ok || !data.result) {
        setSubmitState({
          loading: false,
          error: data.error ?? "Erreur de soumission.",
          details: data.details,
        });
        return;
      }
      setSubmitState({
        loading: false,
        result:
          data.acceptancePageHtml || data.refusalPageHtml
            ? { ...data.result, acceptancePageHtml: data.acceptancePageHtml, refusalPageHtml: data.refusalPageHtml }
            : data.result,
        payload: data.payload,
      });
      setIsFinalSubmitted(true);
    } catch (error) {
      setSubmitState({ loading: false, error: `Erreur reseau: ${(error as Error).message}` });
    }
  }

  async function handlePreviewScore() {
    if (!intake.isOpen) {
      setSubmitState({ loading: false, error: intake.message });
      return;
    }

    if (!validateCurrentStep()) {
      setSubmitState({
        loading: false,
        error: "Merci de completer les champs obligatoires avant de calculer le score.",
      });
      return;
    }

    setSubmitState({ loading: true });
    try {
      const response = await fetch("/api/repairability/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = (await response.json()) as {
        payload?: SubmissionPayload;
        result?: ScoreResponse;
        error?: string;
        details?: string[];
      };

      if (!response.ok || !data.result) {
        setSubmitState({
          loading: false,
          error: data.error ?? "Erreur de calcul du score intermediaire.",
          details: data.details,
        });
        return;
      }

      setSubmitState({ loading: false, result: data.result, payload: data.payload });
      setIsFinalSubmitted(false);
      setStep(5);
    } catch (error) {
      setSubmitState({ loading: false, error: `Erreur reseau: ${(error as Error).message}` });
    }
  }

  const progress = Math.round((step / totalSteps) * 100);
  const dangerSignalDetected = ["smokeObserved", "burnSmellObserved", "liquidLeakObserved", "bladeOrMotorSafetyConcern"].some(
    (field) => answers[field] === "true",
  );
  const completionHints = [
    answers.objectType ? `Type: ${String(answers.objectType)}` : "Type non renseigné",
    answers.mainSymptom ? `Panne: ${String(answers.mainSymptom)}` : "Panne non renseignée",
    answers.brand ? `Marque: ${String(answers.brand)}` : "Marque non renseignée",
  ];

  if (isFinalSubmitted && isAccepted && submitState.result?.acceptancePageHtml) {
    return (
      <iframe
        className="repair-decision-page"
        title="Page de prise en charge"
        srcDoc={submitState.result.acceptancePageHtml}
      />
    );
  }

  if (isFinalSubmitted && !isAccepted && submitState.result?.refusalPageHtml) {
    return (
      <iframe
        className="repair-decision-page"
        title="Page de refus de prise en charge"
        srcDoc={submitState.result.refusalPageHtml}
      />
    );
  }

  return (
    <div className="repair-form-shell">
      <div className="repair-form-container">
        <section className="repair-form-header">
          <p className="repair-form-kicker">Diagnostic guidé</p>
          <h1>Score de réparabilité</h1>
          <p>
            Complète ce formulaire pour vérifier rapidement si ton appareil entre dans mon périmètre de réparation.
            Si le score est suffisant, tu pourras laisser tes coordonnées pour déposer ton objet au lieu de dépôt:
            j'effectuerai ensuite un diagnostic et une tentative de réparation.
          </p>

          <div className="repair-hint-row">
            {completionHints.map((hint) => (
              <span key={hint} className="repair-hint-pill">
                {hint}
              </span>
            ))}
          </div>

          <div className="repair-progress-block">
            <div className="repair-progress-labels">
              <span>
                Étape {step}/{totalSteps}
              </span>
              <span>{stepTitles[step]}</span>
            </div>
            <div className="repair-progress-track">
              <div className="repair-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <small style={{ color: "#5e647d" }}>* Champ obligatoire</small>
          </div>
        </section>

        {dangerSignalDetected && (
          <aside className="repair-alert repair-alert-danger">
            Signal de sécurité détecté. Coupe l'alimentation de l'appareil si nécessaire et attends une prise en charge sécurisée.
          </aside>
        )}

        {!intake.isOpen && (
          <aside className="repair-alert repair-alert-warning">
            <strong>{intake.title}</strong>
            <span>{intake.message}</span>
          </aside>
        )}

        {step === 5 ? (
          <section className="repair-score-card">
            <h2>Résultat intermédiaire</h2>
            {submitState.result ? (
              <>
                <div className="repair-score-metrics">
                  <span>
                    <strong>{submitState.result.repairabilityScore}</strong>/100
                    <small>Réparabilité</small>
                  </span>
                  <span>
                    <strong>{submitState.result.confidenceScore}</strong>/100
                    <small>Confiance</small>
                  </span>
                </div>
                <p>Décision: {getScoreVerdict(submitState.result.repairabilityScore)}</p>
                {isSoftAccept && (
                  <p className="repair-score-warning">
                    Tu peux continuer vers le contact. La suite valide seulement le dépôt et le diagnostic: la
                    réparation reste une tentative sans garantie.
                  </p>
                )}
                {isStrongAccept && <p className="repair-score-success">La prise en charge est validée.</p>}
                {!isAccepted && (
                  <p className="repair-score-danger">
                    Cette demande ne peut pas être prise en charge dans ce cadre. Si un risque de sécurité est présent,
                    il vaut mieux passer par un réparateur professionnel.
                  </p>
                )}
              </>
            ) : (
              <p className="repair-score-danger">Aucun score intermédiaire disponible.</p>
            )}
          </section>
        ) : (
          <StepRenderer
            questions={questions}
            answers={answers}
            objectTypeOptions={objectTypeOptions}
            mainSymptomOptions={mainSymptomOptions}
            requiredFields={stepRequiredFields[step] ?? []}
            fieldErrors={fieldErrors}
            onChange={updateAnswer}
          />
        )}

        <div className="repair-action-bar">
          <button
            type="button"
            className="repair-button repair-button-secondary"
            disabled={step === 1 || submitState.loading}
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          >
            Retour
          </button>

          {step === 4 ? (
            <button
              type="button"
              className="repair-button repair-button-primary"
              disabled={submitState.loading || !intake.isOpen}
              onClick={handlePreviewScore}
            >
              {submitState.loading ? "Calcul..." : "Calculer mon score"}
            </button>
          ) : step === 5 ? (
            <button
              type="button"
              className="repair-button repair-button-primary"
              disabled={submitState.loading || !intake.isOpen}
              onClick={shouldSubmitWithoutContact ? handleSubmit : () => setStep(6)}
            >
              {submitState.loading
                ? "Envoi..."
                : isAccepted
                  ? "Continuer vers le contact"
                  : "Enregistrer sans contact"}
            </button>
          ) : step < totalSteps ? (
            <button
              type="button"
              className="repair-button repair-button-primary"
              disabled={submitState.loading || !intake.isOpen}
              onClick={() => {
                if (!validateCurrentStep()) {
                  setSubmitState({
                    loading: false,
                    error: "Merci de completer les champs obligatoires avant de passer a l'etape suivante.",
                  });
                  return;
                }
                setSubmitState({ loading: false, result: submitState.result, payload: submitState.payload });
                setStep((prev) => Math.min(totalSteps, prev + 1));
              }}
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              className="repair-button repair-button-submit"
              disabled={submitState.loading || !intake.isOpen}
              onClick={handleSubmit}
            >
              {submitState.loading ? "Envoi..." : "Envoyer ma demande"}
            </button>
          )}
        </div>

        {submitState.error && (
          <div className="repair-alert repair-alert-danger">
            <p style={{ margin: 0 }}>{submitState.error}</p>
            {submitState.details && submitState.details.length > 0 && (
              <ul style={{ margin: "8px 0 0 16px" }}>
                {submitState.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isFinalSubmitted && submitState.payload && (
          <section className="repair-success-panel">
            <h2>Demande envoyée</h2>
            {isAccepted ? (
              <>
                <p>Merci, ta demande est bien transmise. Voici la procédure de dépôt de l'objet:</p>
                <ol style={{ margin: "4px 0 0 18px", padding: 0, lineHeight: 1.5 }}>
                  <li>Emballe l'objet de façon sécurisée et propre.</li>
                  <li>Ajoute un mot avec ton prénom, ton email, et la panne observée.</li>
                  <li>Dépose l'objet à l'adresse indiquée dans la page de prise en charge.</li>
                </ol>
              </>
            ) : (
              <p>
                Merci, ta demande est enregistrée. D'après les réponses, elle ne sera probablement pas prise en charge,
                mais elle est bien transmise pour suivi.
              </p>
            )}
            <small>Reference soumission: {submitState.payload.submissionId}</small>
          </section>
        )}
      </div>
    </div>
  );
}

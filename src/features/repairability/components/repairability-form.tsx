"use client";

import { useMemo, useState } from "react";
import { getObjectTypesForFamily } from "../config/object-catalog";
import { getQuestionsForStep } from "../config/question-flow";
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
  3: "Symptômes observés",
  4: "Vérification de sécurité",
  5: "Prise en charge",
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
  firstName: "Prénom",
  email: "Email",
  brand: "Marque",
  failureWhen: "Apparition de la panne",
  stillPowersOn: "Etat d'allumage",
  mainSymptom: "Symptôme principal",
  mainSymptomOther: "Description du symptome principal",
  circumstances: "Contexte de la panne",
  circumstancesOther: "Precision du contexte",
  secondarySymptomsOther: "Autres symptomes",
  visibleDamageOther: "Autres dommages visibles",
  replacementPartAvailability: "Disponibilite des pieces",
  consent: "Consentement à l'utilisation des données",
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
  const isAccepted = submitState.result ? isCareAccepted(submitState.result) : false;
  const shouldSubmitWithoutContact = submitState.result ? !requiresContactBeforeSubmit(submitState.result) : false;

  function getRefusalExplanation(result: ScoreResponse): string {
    if (result.riskLevel === "high") return "Un signal de sécurité nécessite l'avis d'un réparateur professionnel.";
    if (result.recommendedNextStep === "professionnel_recommande") {
      return "Cette panne nécessite un réparateur professionnel dans le cadre actuel.";
    }
    return result.explanations[0] || "Cette demande sort du périmètre de prise en charge actuel.";
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

  async function handleCheckEligibility() {
    if (!intake.isOpen) {
      setSubmitState({ loading: false, error: intake.message });
      return;
    }

    if (!validateCurrentStep()) {
      setSubmitState({
        loading: false,
        error: "Merci de compléter les champs obligatoires avant de vérifier la prise en charge.",
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
          error: data.error ?? "Erreur lors de la vérification de la prise en charge.",
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
          <h1>Vérifier la prise en charge</h1>
          <p>
            Complète ce formulaire pour vérifier rapidement si ton appareil entre dans mon périmètre de réparation.
            Si l'objet peut être pris en charge, tu pourras laisser tes coordonnées pour le déposer au lieu de dépôt:
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
            <h2>Résultat de la vérification</h2>
            {submitState.result ? (
              <>
                {isAccepted ? (
                  <p className="repair-score-success">
                    Votre objet peut être pris en charge. La réparation reste une tentative bénévole, sans garantie de résultat.
                  </p>
                ) : (
                  <p className="repair-score-danger">Objet non pris en charge : {getRefusalExplanation(submitState.result)}</p>
                )}
              </>
            ) : (
              <p className="repair-score-danger">Aucun résultat de prise en charge disponible.</p>
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
              onClick={handleCheckEligibility}
            >
              {submitState.loading ? "Vérification..." : "Vérifier la prise en charge"}
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
                    error: "Merci de compléter les champs obligatoires avant de passer à l'étape suivante.",
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
                  <li>Dépose l'objet sur l'étagère à disposition chez Oufticoop, dans l'entrée du magasin. Code du cadenas : 1314.</li>
                </ol>
              </>
            ) : (
              <p>
                Merci, ta demande est enregistrée. D'après les réponses, elle ne sera probablement pas prise en charge,
                mais elle est bien transmise pour suivi.
              </p>
            )}
            <small>Référence de soumission : {submitState.payload.submissionId}</small>
          </section>
        )}
      </div>
    </div>
  );
}

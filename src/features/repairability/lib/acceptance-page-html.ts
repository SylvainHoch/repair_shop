import type { ScoreResponse, SubmissionPayload } from "../types";
import { isCareAccepted } from "./decision";

const defaultDepositAddress = "Adresse du dépôt à compléter dans REPAIRABILITY_DROP_OFF_ADDRESS";
const depositShelfInstructions = "Déposez l'objet sur l'étagère mise à disposition chez Oufticoop, dans l'entrée du magasin.";
const depositLockCode = "1314";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildAcceptancePageHtml({
  payload,
  result,
  depositAddress,
}: {
  payload: SubmissionPayload;
  result: ScoreResponse;
  depositAddress?: string;
}): string {
  const answers = payload.answers;
  const address = depositAddress?.trim() || defaultDepositAddress;
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const objectLabel = [answers.brand, answers.model, answers.objectDescription].filter(Boolean).join(" - ");
  const title = "Prise en charge validée";

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
        --accent: #485696;
        --success: #047857;
        --surface: #ffffff;
        --paper: #faf8f4;
        --text: #1f2438;
        --muted: #5e647d;
        --line: rgba(72, 86, 150, 0.14);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        background: linear-gradient(180deg, #faf8f4 0%, #f1f1f1 100%);
        color: var(--text);
      }

      main {
        width: min(920px, calc(100% - 32px));
        margin: 0 auto;
        padding: 40px 0;
      }

      .hero, .panel {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 18px 36px rgba(31, 36, 56, 0.08);
      }

      .hero {
        display: grid;
        gap: 12px;
        padding: clamp(22px, 5vw, 34px);
        border-left: 8px solid var(--success);
      }

      .kicker {
        margin: 0;
        color: var(--success);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1, h2, p { margin: 0; }

      h1 {
        color: var(--accent);
        font-size: clamp(32px, 7vw, 48px);
        line-height: 1.04;
      }

      .summary {
        max-width: 68ch;
        color: var(--muted);
        line-height: 1.65;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 0.75fr);
        gap: 16px;
        margin-top: 16px;
      }

      .panel {
        padding: 22px;
      }

      .panel h2 {
        color: var(--accent);
        font-size: 22px;
      }

      ol, ul {
        margin: 16px 0 0;
        padding-left: 22px;
        color: var(--muted);
        line-height: 1.6;
      }

      li + li { margin-top: 8px; }

      address {
        margin-top: 16px;
        padding: 16px;
        border: 1px solid rgba(4, 120, 87, 0.18);
        border-radius: 10px;
        background: #ecfdf5;
        color: #064e3b;
        font-style: normal;
        font-weight: 800;
        line-height: 1.45;
        white-space: pre-line;
      }

      .map {
        width: 100%;
        height: 220px;
        margin-top: 14px;
        border: 0;
        border-radius: 10px;
      }

      .map-link {
        display: inline-block;
        margin-top: 10px;
        color: var(--accent);
        font-weight: 800;
      }

      .meta {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }

      .meta div {
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--paper);
      }

      .meta span {
        display: block;
        color: var(--muted);
        font-size: 13px;
        font-weight: 700;
      }

      .meta strong {
        display: block;
        margin-top: 3px;
        overflow-wrap: anywhere;
      }

      .notice {
        margin-top: 16px;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.55;
      }

      @media (max-width: 760px) {
        main { padding: 24px 0; }
        .grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="kicker">Demande acceptée</p>
        <h1>${title}</h1>
        <p class="summary">
          Bonjour ${escapeHtml(answers.firstName || "")}, votre demande entre dans le périmètre de réparation bénévole.
          Vous pouvez déposer l'objet à l'adresse ci-dessous en suivant la procédure.
        </p>
      </section>

      <div class="grid">
        <section class="panel" aria-labelledby="procedure-title">
          <h2 id="procedure-title">Procédure de dépôt</h2>
          <ol>
            <li>Nettoyez l'objet et retirez les accessoires non nécessaires.</li>
            <li>Emballez-le de façon stable, surtout s'il contient du verre, une lame, une batterie ou une pièce mobile.</li>
            <li>Ajoutez un papier avec votre prénom, votre adresse email, la référence de soumission et la panne observée.</li>
            <li>${depositShelfInstructions}</li>
            <li>Le code du cadenas est <strong>${depositLockCode}</strong>.</li>
            <li>Attendez le message de suivi avant de revenir chercher l'objet.</li>
          </ol>
          <p class="notice">
            La prise en charge valide seulement le dépôt et le diagnostic. La réparation reste une tentative bénévole,
            sans garantie de résultat.
          </p>
        </section>

        <aside class="panel" aria-labelledby="address-title">
          <h2 id="address-title">Adresse de dépôt</h2>
          <address>${escapeHtml(address)}</address>
          <iframe class="map" title="Carte du lieu de dépôt" src="${escapeHtml(mapUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          <a class="map-link" href="${escapeHtml(mapLink)}" target="_blank" rel="noreferrer">Ouvrir l'itinéraire</a>
          <div class="meta">
            <div>
              <span>Référence</span>
              <strong>${escapeHtml(payload.submissionId)}</strong>
            </div>
            <div>
              <span>Objet</span>
              <strong>${escapeHtml(objectLabel || answers.objectType || "Objet à réparer")}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </body>
</html>`;
}

function getRefusalReason(result: ScoreResponse): string {
  if (result.riskLevel === "high") {
    return "La demande présente un signal de sécurité qui dépasse le cadre d'une réparation bénévole.";
  }

  if (result.recommendedNextStep === "professionnel_recommande") {
    return "Le diagnostic indique qu'un réparateur professionnel est préférable pour ce type de panne.";
  }

  if (result.recommendedNextStep === "non_recommande") {
    return "Les informations fournies indiquent une probabilité de réparation trop faible dans ce cadre.";
  }

  return "La demande sort du périmètre de prise en charge actuel.";
}

export function buildRefusalPageHtml({
  payload,
  result,
}: {
  payload: SubmissionPayload;
  result: ScoreResponse;
}): string {
  const answers = payload.answers;
  const title = "Demande non prise en charge";
  const objectLabel = [answers.brand, answers.model, answers.objectDescription].filter(Boolean).join(" - ");
  const explanations = result.explanations.length
    ? result.explanations
    : [getRefusalReason(result)];

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
        --accent: #485696;
        --warning: #92400e;
        --surface: #ffffff;
        --paper: #faf8f4;
        --text: #1f2438;
        --muted: #5e647d;
        --line: rgba(72, 86, 150, 0.14);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        background: linear-gradient(180deg, #faf8f4 0%, #f1f1f1 100%);
        color: var(--text);
      }

      main {
        width: min(920px, calc(100% - 32px));
        margin: 0 auto;
        padding: 40px 0;
      }

      .hero, .panel {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 18px 36px rgba(31, 36, 56, 0.08);
      }

      .hero {
        display: grid;
        gap: 12px;
        padding: clamp(22px, 5vw, 34px);
        border-left: 8px solid var(--warning);
      }

      .kicker {
        margin: 0;
        color: var(--warning);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1, h2, p { margin: 0; }

      h1 {
        color: var(--accent);
        font-size: clamp(32px, 7vw, 48px);
        line-height: 1.04;
      }

      .summary {
        max-width: 70ch;
        color: var(--muted);
        line-height: 1.65;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 0.75fr);
        gap: 16px;
        margin-top: 16px;
      }

      .panel {
        padding: 22px;
      }

      .panel h2 {
        color: var(--accent);
        font-size: 22px;
      }

      ul {
        margin: 16px 0 0;
        padding-left: 22px;
        color: var(--muted);
        line-height: 1.6;
      }

      li + li { margin-top: 8px; }

      .reason {
        margin-top: 16px;
        padding: 16px;
        border: 1px solid rgba(146, 64, 14, 0.2);
        border-radius: 10px;
        background: #fffbeb;
        color: #78350f;
        font-weight: 700;
        line-height: 1.5;
      }

      .meta {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }

      .meta div {
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--paper);
      }

      .meta span {
        display: block;
        color: var(--muted);
        font-size: 13px;
        font-weight: 700;
      }

      .meta strong {
        display: block;
        margin-top: 3px;
        overflow-wrap: anywhere;
      }

      a {
        color: var(--accent);
        font-weight: 800;
      }

      .notice {
        margin-top: 16px;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.55;
      }

      @media (max-width: 760px) {
        main { padding: 24px 0; }
        .grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="kicker">Réponse au diagnostic</p>
        <h1>${title}</h1>
        <p class="summary">
          Bonjour ${escapeHtml(answers.firstName || "")}, merci pour votre demande. Après analyse des réponses,
          je ne peux pas prendre cet objet en charge dans le cadre de cette réparation bénévole.
        </p>
      </section>

      <div class="grid">
        <section class="panel" aria-labelledby="reason-title">
          <h2 id="reason-title">Pourquoi cette décision ?</h2>
          <div class="reason">${escapeHtml(getRefusalReason(result))}</div>
          <ul>
            ${explanations.map((explanation) => `<li>${escapeHtml(explanation)}</li>`).join("")}
          </ul>
          <p class="notice">
            Cette décision évite un dépôt inutile ou une intervention risquée. Elle ne signifie pas forcément que
            l'objet est irréparable, seulement qu'il vaut mieux passer par une autre voie.
          </p>
        </section>

        <aside class="panel" aria-labelledby="alternatives-title">
          <h2 id="alternatives-title">Alternatives possibles</h2>
          <ul>
            <li>Contacter un réparateur professionnel, surtout en cas d'odeur de brûlé, fumée, fuite, batterie abîmée ou appareil puissant.</li>
            <li>Vérifier si l'objet est encore sous garantie ou couvert par une extension de garantie.</li>
            <li>Participer à un Repair Café proche de chez vous pour obtenir un avis accompagné.</li>
            <li>Consulter des guides de diagnostic sur <a href="https://www.ifixit.com/" target="_blank" rel="noreferrer">iFixit</a>.</li>
            <li>Comparer le prix d'une pièce détachée et le coût d'une réparation avant de remplacer l'objet.</li>
          </ul>
          <div class="meta">
            <div>
              <span>Référence</span>
              <strong>${escapeHtml(payload.submissionId)}</strong>
            </div>
            <div>
              <span>Objet</span>
              <strong>${escapeHtml(objectLabel || answers.objectType || "Objet à réparer")}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </body>
</html>`;
}

export type IntakeStatus = "open" | "paused" | "full" | "away";

export interface IntakeConfig {
  status: IntakeStatus;
  isOpen: boolean;
  title: string;
  message: string;
}

const statusLabels: Record<IntakeStatus, { title: string; message: string }> = {
  open: {
    title: "Demandes ouvertes",
    message: "Les nouvelles demandes de prise en charge sont ouvertes.",
  },
  paused: {
    title: "Demandes temporairement suspendues",
    message: "Les nouvelles prises en charge sont suspendues pour le moment. Merci de revenir plus tard.",
  },
  full: {
    title: "Trop d'objets en attente",
    message: "J'ai deja trop d'objets en attente. Les nouvelles prises en charge reprendront bientot.",
  },
  away: {
    title: "Absence temporaire",
    message: "Je suis absent pour le moment. Les nouvelles prises en charge reprendront bientot.",
  },
};

function parseIntakeStatus(value?: string): IntakeStatus {
  if (value === "paused" || value === "full" || value === "away") return value;
  return "open";
}

export function getIntakeConfig(): IntakeConfig {
  const status = parseIntakeStatus(process.env.REPAIRABILITY_INTAKE_STATUS);
  const customMessage = process.env.REPAIRABILITY_INTAKE_MESSAGE?.trim();
  const labels = statusLabels[status];

  return {
    status,
    isOpen: status === "open",
    title: labels.title,
    message: customMessage || labels.message,
  };
}

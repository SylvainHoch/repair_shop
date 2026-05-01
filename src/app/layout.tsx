import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IntakeBanner } from "../features/repairability/components/intake-banner";
import { getIntakeConfig } from "../features/repairability/lib/intake-status";
import "./globals.css";

export const metadata: Metadata = {
  title: "Réparation bénévole d'objets du quotidien",
  description:
    "Service local de réparation bénévole: évaluation via formulaire, dépôt physique, tentative de réparation et restitution.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const intake = getIntakeConfig();

  return (
    <html lang="fr">
      <body>
        <IntakeBanner intake={intake} />
        {children}
      </body>
    </html>
  );
}

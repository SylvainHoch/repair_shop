import Link from "next/link";
import { RepairabilityForm } from "../../features/repairability/components/repairability-form";
import { getIntakeConfig } from "../../features/repairability/lib/intake-status";

export default function ReparabilitePage() {
  const intake = getIntakeConfig();

  return (
    <main className="landing-page">
      <div className="form-route-nav">
        <Link href="/">← Retour à l'accueil</Link>
      </div>

      <RepairabilityForm intake={intake} />
    </main>
  );
}

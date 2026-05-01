import type { IntakeConfig } from "../lib/intake-status";

export function IntakeBanner({ intake }: { intake: IntakeConfig }) {
  if (intake.isOpen) return null;

  return (
    <aside className="intake-banner" role="status" aria-live="polite">
      <div className="intake-banner-inner">
        <strong>{intake.title}</strong>
        <span>{intake.message}</span>
      </div>
    </aside>
  );
}

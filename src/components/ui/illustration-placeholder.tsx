"use client";

interface IllustrationPlaceholderProps {
  title: string;
  subtitle?: string;
  className?: string;
  variant?: "hero" | "card" | "compact";
}

export function IllustrationPlaceholder({
  title,
  subtitle,
  className,
  variant = "card",
}: IllustrationPlaceholderProps) {
  return (
    <div className={["illustration-placeholder", `illustration-placeholder-${variant}`, className].filter(Boolean).join(" ")}>
      <div className="illustration-shapes" aria-hidden="true">
        <span className="illustration-shape illustration-shape-main" />
        <span className="illustration-shape illustration-shape-secondary" />
        <span className="illustration-shape illustration-shape-accent" />
      </div>
      <div className="illustration-copy">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </div>
  );
}

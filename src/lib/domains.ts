import { Domain } from "./enums";

export const DOMAIN_LABELS: Record<Domain, string> = {
  TRUST_BEHAVIOR: "Trust / Behavior",
  COGNITION_LABOR: "Cognition / Labor",
  LABOR_ECONOMY: "Labor / Economy",
  SECURITY_RISK: "Security / Risk",
  OTHER: "Other",
};

// Kept inside the Andus Labs palette: each domain gets a distinct tint/text
// pairing built from the same handful of brand colors rather than reaching
// for arbitrary Tailwind hues.
export const DOMAIN_COLORS: Record<Domain, string> = {
  TRUST_BEHAVIOR: "bg-brand-periwinkle/50 text-brand-ink border-brand-accent/40",
  COGNITION_LABOR: "bg-brand-cta/10 text-brand-cta border-brand-cta/30",
  LABOR_ECONOMY: "bg-brand-primary/10 text-brand-primary border-brand-primary/30",
  SECURITY_RISK: "bg-brand-ink/10 text-brand-ink border-brand-ink/30",
  OTHER: "bg-brand-muted/10 text-brand-muted border-brand-muted/30",
};

export const ALL_DOMAINS = Object.keys(DOMAIN_LABELS) as Domain[];

export function domainFromLabel(label: string): Domain {
  const normalized = label.trim().toLowerCase().replace(/[\s/_-]+/g, "_");
  const hit = (Object.keys(DOMAIN_LABELS) as Domain[]).find(
    (d) => d.toLowerCase() === normalized
  );
  return hit ?? "OTHER";
}

import { Domain } from "./enums";

export const DOMAIN_LABELS: Record<Domain, string> = {
  TRUST_BEHAVIOR: "Trust / Behavior",
  COGNITION_LABOR: "Cognition / Labor",
  LABOR_ECONOMY: "Labor / Economy",
  SECURITY_RISK: "Security / Risk",
  OTHER: "Other",
};

export const DOMAIN_COLORS: Record<Domain, string> = {
  TRUST_BEHAVIOR: "bg-violet-100 text-violet-800 border-violet-200",
  COGNITION_LABOR: "bg-amber-100 text-amber-800 border-amber-200",
  LABOR_ECONOMY: "bg-emerald-100 text-emerald-800 border-emerald-200",
  SECURITY_RISK: "bg-rose-100 text-rose-800 border-rose-200",
  OTHER: "bg-slate-100 text-slate-700 border-slate-200",
};

export const ALL_DOMAINS = Object.keys(DOMAIN_LABELS) as Domain[];

export function domainFromLabel(label: string): Domain {
  const normalized = label.trim().toLowerCase().replace(/[\s/_-]+/g, "_");
  const hit = (Object.keys(DOMAIN_LABELS) as Domain[]).find(
    (d) => d.toLowerCase() === normalized
  );
  return hit ?? "OTHER";
}

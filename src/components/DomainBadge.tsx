import { Domain } from "@/lib/enums";
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/domains";

// `domain` comes straight off the Entry row, which is a plain string column
// (SQLite has no enum type) -- fall back to the OTHER styling for any value
// that isn't one of the known domains.
export default function DomainBadge({ domain }: { domain: string }) {
  const key = (domain in DOMAIN_LABELS ? domain : Domain.OTHER) as Domain;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${DOMAIN_COLORS[key]}`}
    >
      {DOMAIN_LABELS[key]}
    </span>
  );
}

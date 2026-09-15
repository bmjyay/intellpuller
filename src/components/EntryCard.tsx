import Link from "next/link";
import type { EntryWithRelations } from "@/lib/types";
import { estimateReadTime } from "@/lib/readtime";
import { DOMAIN_LABELS } from "@/lib/domains";
import type { Domain } from "@/lib/enums";
import PatternPill from "./PatternPill";
import EntryActionBar from "./EntryActionBar";
import StatusPill from "./StatusPill";

function formatYear(d: Date | null): string | null {
  return d ? new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(d) : null;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function EntryCard({ entry, index }: { entry: EntryWithRelations; index?: number }) {
  const year = formatYear(entry.publishedAt);
  const readMins = estimateReadTime(entry.finding, entry.whyItMatters);
  const used = !!entry.usedAt;
  const eyebrow = ["Evidence", ...DOMAIN_LABELS[entry.domain as Domain].split(" / ")].join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-muted/20 bg-white shadow-sm transition hover:shadow-lg">
      {/* Dark header */}
      <div className="relative overflow-hidden bg-brand-ink px-5 pb-4 pt-5">
        {index && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-5 -right-1 select-none font-serif text-8xl font-bold leading-none text-white/10"
          >
            {index}
          </span>
        )}
        <div className="relative flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-muted">{eyebrow}</p>
          {entry.status !== "APPROVED" && <StatusPill status={entry.status} />}
        </div>

        <Link
          href={`/entries/${entry.id}`}
          className="relative mt-2.5 block font-serif text-xl font-bold leading-snug text-white decoration-white/40 hover:underline"
        >
          {entry.title}
        </Link>

        <p className="relative mt-2 text-xs text-white/60">
          {[year, entry.publication && <em key="pub">{entry.publication}</em>, entry.org]
            .filter(Boolean)
            .map((part, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {part}
              </span>
            ))}
          {" · "}~{readMins} min brief
        </p>

        <div className="relative mt-3">
          <EntryActionBar id={entry.id} status={entry.status} liked={entry.liked} used={used} variant="card" tone="dark" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        {entry.authors && (
          <>
            <p className="text-xs text-brand-muted">{entry.authors}</p>
            <hr className="border-brand-muted/15" />
          </>
        )}

        <div className="flex items-start gap-3">
          {index && (
            <span aria-hidden="true" className="font-serif text-3xl font-bold leading-none text-brand-muted/60">
              {index}
            </span>
          )}
          <p className={`text-sm leading-relaxed text-brand-ink/90 ${used ? "line-through decoration-brand-muted" : ""}`}>
            {entry.finding}
          </p>
        </div>

        {entry.whyItMatters && (
          <p className="text-xs leading-relaxed text-brand-muted">
            <span className="font-semibold text-brand-ink/70">Why it matters. </span>
            {entry.whyItMatters}
          </p>
        )}

        {entry.patterns.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.patterns.map((p) => (
              <PatternPill key={p.id} name={p.name} />
            ))}
          </div>
        )}

        <Link
          href={`/entries/${entry.id}`}
          className="mt-auto rounded-md border border-brand-muted/40 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-muted transition group-hover:border-brand-ink group-hover:text-brand-ink"
        >
          Read the full brief
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-brand-muted/15 bg-brand-bg px-5 py-2.5">
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted underline decoration-brand-muted/40 underline-offset-2 transition hover:text-brand-ink"
        >
          Source
        </a>
        <span className="text-[10px] font-medium uppercase tracking-wide text-brand-muted/70">{hostname(entry.url)}</span>
      </div>
    </article>
  );
}

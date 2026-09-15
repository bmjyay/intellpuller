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

export default function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const year = formatYear(entry.publishedAt);
  const readMins = estimateReadTime(entry.finding, entry.whyItMatters);
  const used = !!entry.usedAt;
  const eyebrow = ["Evidence", ...DOMAIN_LABELS[entry.domain as Domain].split(" / ")].join(" · ");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-muted/20 bg-white shadow-sm transition hover:shadow-lg">
      {/* Header -- a fixed min-height + clamped title keeps every card in a
          row breaking at the same point, regardless of title length. */}
      <div className="flex min-h-[13rem] flex-col bg-brand-primary px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">{eyebrow}</p>
          {entry.status !== "APPROVED" && <StatusPill status={entry.status} />}
        </div>

        <Link
          href={`/entries/${entry.id}`}
          className="mt-2.5 block line-clamp-2 font-serif text-xl font-bold leading-snug text-white decoration-white/40 hover:underline"
        >
          {entry.title}
        </Link>

        <p className="mt-2 text-xs text-white/60">
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

        <div className="mt-auto pt-3">
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

        <p className={`text-sm leading-relaxed text-brand-ink/90 ${used ? "line-through decoration-brand-muted" : ""}`}>
          {entry.finding}
        </p>

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

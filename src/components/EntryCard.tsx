import Link from "next/link";
import type { EntryWithRelations } from "@/lib/types";
import { estimateReadTime } from "@/lib/readtime";
import DomainBadge from "./DomainBadge";
import PatternPill from "./PatternPill";
import ScoreDots from "./ScoreDots";
import EntryActionBar from "./EntryActionBar";
import StatusPill from "./StatusPill";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export default function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const meta = [entry.org, entry.publication].filter(Boolean).join(" · ");
  const date = formatDate(entry.publishedAt);
  const readMins = estimateReadTime(entry.finding, entry.whyItMatters);
  const used = !!entry.usedAt;

  return (
    <article
      className={`group flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
        used ? "border-brand-muted/20 opacity-70" : "border-brand-muted/25 hover:border-brand-accent/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DomainBadge domain={entry.domain} />
          {entry.status !== "APPROVED" && <StatusPill status={entry.status} />}
        </div>
        <div className="flex items-center gap-2">
          <ScoreDots score={entry.qualityScore} />
        </div>
      </div>

      <div>
        <Link
          href={`/entries/${entry.id}`}
          className={`text-base font-semibold leading-snug text-brand-ink hover:underline ${used ? "line-through decoration-brand-muted" : ""}`}
        >
          {entry.title}
        </Link>
        {(meta || date) && (
          <p className="mt-1 text-xs text-brand-muted">
            {meta}
            {meta && date ? " · " : ""}
            {date}
            {" · "}~{readMins} min brief
          </p>
        )}
        {entry.authors && <p className="mt-0.5 text-xs text-brand-muted/80">{entry.authors}</p>}
      </div>

      <p className="text-sm leading-relaxed text-brand-ink/90">{entry.finding}</p>

      {entry.whyItMatters && (
        <p className="rounded-md bg-brand-bg p-2.5 text-xs leading-relaxed text-brand-ink/80">
          <span className="font-medium text-brand-muted">Why it matters: </span>
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

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <EntryActionBar id={entry.id} status={entry.status} liked={entry.liked} used={used} variant="card" />
        <div className="flex shrink-0 items-center gap-3 text-xs">
          <a href={entry.url} target="_blank" rel="noreferrer" className="font-medium text-brand-primary hover:underline">
            Source &rarr;
          </a>
          <Link href={`/entries/${entry.id}`} className="text-brand-muted hover:text-brand-ink">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

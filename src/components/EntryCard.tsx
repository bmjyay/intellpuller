import Link from "next/link";
import type { EntryWithRelations } from "@/lib/types";
import DomainBadge from "./DomainBadge";
import PatternPill from "./PatternPill";
import ScoreDots from "./ScoreDots";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export default function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const meta = [entry.org, entry.publication].filter(Boolean).join(" · ");
  const date = formatDate(entry.publishedAt);

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <DomainBadge domain={entry.domain} />
        <ScoreDots score={entry.qualityScore} />
      </div>

      <div>
        <Link href={`/entries/${entry.id}`} className="text-base font-semibold leading-snug text-ink hover:underline">
          {entry.title}
        </Link>
        {(meta || date) && (
          <p className="mt-1 text-xs text-slate-500">
            {meta}
            {meta && date ? " · " : ""}
            {date}
          </p>
        )}
        {entry.authors && <p className="mt-0.5 text-xs text-slate-400">{entry.authors}</p>}
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{entry.finding}</p>

      {entry.whyItMatters && (
        <p className="rounded-md bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
          <span className="font-medium text-slate-500">Why it matters: </span>
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

      <div className="mt-auto flex items-center justify-between pt-1 text-xs">
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-700 hover:underline"
        >
          Read source &rarr;
        </a>
        <Link href={`/entries/${entry.id}`} className="text-slate-400 hover:text-slate-600">
          Details
        </Link>
      </div>
    </article>
  );
}

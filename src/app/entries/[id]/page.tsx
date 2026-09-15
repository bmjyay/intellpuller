import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { estimateReadTime } from "@/lib/readtime";
import DomainBadge from "@/components/DomainBadge";
import PatternPill from "@/components/PatternPill";
import EntryActionBar from "@/components/EntryActionBar";
import EditEntryForm from "@/components/EditEntryForm";
import StatusPill from "@/components/StatusPill";

export const dynamic = "force-dynamic";

export default async function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { patterns: true, source: true },
  });
  if (!entry) notFound();

  const dateInput = entry.publishedAt ? entry.publishedAt.toISOString().slice(0, 10) : "";
  const readMins = estimateReadTime(entry.finding, entry.whyItMatters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DomainBadge domain={entry.domain} />
          <StatusPill status={entry.status} />
          <span className="text-xs text-brand-muted">~{readMins} min brief</span>
        </div>
        <EntryActionBar id={entry.id} status={entry.status} liked={entry.liked} used={!!entry.usedAt} variant="full" />
      </div>

      <a
        href={entry.url}
        target="_blank"
        rel="noreferrer"
        className="text-xs font-medium text-brand-primary hover:underline"
      >
        {entry.url} &rarr;
      </a>

      {entry.patterns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.patterns.map((p) => (
            <PatternPill key={p.id} name={p.name} />
          ))}
        </div>
      )}

      <EditEntryForm
        id={entry.id}
        title={entry.title}
        authors={entry.authors ?? ""}
        org={entry.org ?? ""}
        publication={entry.publication ?? ""}
        domain={entry.domain}
        qualityScore={entry.qualityScore ?? ""}
        finding={entry.finding}
        twist={entry.twist ?? ""}
        whyItMatters={entry.whyItMatters ?? ""}
      />

      <details className="rounded-xl border border-brand-muted/20 bg-white p-4 text-xs text-brand-muted">
        <summary className="cursor-pointer select-none font-medium text-brand-ink/70">
          Audit trail &amp; raw source excerpt
        </summary>
        <dl className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
          <dt className="text-brand-muted">Added by</dt>
          <dd>{entry.addedBy ?? "unknown"}</dd>
          <dt className="text-brand-muted">Reviewed by</dt>
          <dd>{entry.reviewedBy ?? "—"}</dd>
          <dt className="text-brand-muted">Published</dt>
          <dd>{dateInput || "—"}</dd>
          <dt className="text-brand-muted">Credible flag (from curation)</dt>
          <dd>{entry.credibleFlag ? "yes" : "no"}</dd>
          <dt className="text-brand-muted">Used</dt>
          <dd>{entry.usedAt ? entry.usedAt.toISOString().slice(0, 10) : "not yet"}</dd>
          <dt className="text-brand-muted">Source</dt>
          <dd>{entry.source?.name ?? "manual"}</dd>
        </dl>
        {entry.rawExcerpt && (
          <p className="mt-3 whitespace-pre-wrap rounded-md bg-brand-bg p-3 leading-relaxed">{entry.rawExcerpt}</p>
        )}
      </details>
    </div>
  );
}

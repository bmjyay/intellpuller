import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildEntryWhere } from "@/lib/entryQuery";
import { estimateReadTime } from "@/lib/readtime";
import DomainBadge from "@/components/DomainBadge";
import StatusPill from "@/components/StatusPill";
import EntryActionBar from "@/components/EntryActionBar";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

type SearchParams = { domain?: string; q?: string };

export default async function ArchivePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { domain, q } = await searchParams;

  const where = buildEntryWhere({ status: ["REJECTED", "ARCHIVED"], domain, q });

  const entries = await prisma.entry.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { patterns: true, source: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Archive</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Rejected during review, or approved once and later retired. Nothing here shows up on
          the dashboard, but it's kept (rather than deleted) so it doesn't get re-ingested and
          re-reviewed from scratch, and can be restored if a call changes.
        </p>
      </div>

      <FilterBar domain={domain} q={q} clearHref="/archive" />

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-muted/30 p-10 text-center text-sm text-brand-muted">
          Nothing archived yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-brand-muted/20 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <DomainBadge domain={entry.domain} />
                    <StatusPill status={entry.status} />
                    <span className="text-xs text-brand-muted">
                      ~{estimateReadTime(entry.finding, entry.whyItMatters)} min brief
                    </span>
                  </div>
                  <Link href={`/entries/${entry.id}`} className="font-semibold text-brand-ink hover:underline">
                    {entry.title}
                  </Link>
                  <p className="text-xs text-brand-muted">
                    {[entry.org, entry.publication].filter(Boolean).join(" · ")}
                  </p>
                  <p className="max-w-3xl text-sm text-brand-ink/90">{entry.finding}</p>
                </div>
                <EntryActionBar id={entry.id} status={entry.status} liked={entry.liked} used={!!entry.usedAt} variant="compact" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

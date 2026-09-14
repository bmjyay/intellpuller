import Link from "next/link";
import { EntryStatus } from "@/lib/enums";
import { prisma } from "@/lib/db";
import { estimateReadTime } from "@/lib/readtime";
import DomainBadge from "@/components/DomainBadge";
import ScoreDots from "@/components/ScoreDots";
import EntryActionBar from "@/components/EntryActionBar";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const entries = await prisma.entry.findMany({
    where: { status: EntryStatus.PENDING },
    orderBy: { createdAt: "desc" },
    include: { patterns: true, source: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Review queue</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Automation pulled these in and curation judged them credible and quality &ge; 3, but
          nothing goes on the dashboard without a human looking at it first.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-muted/30 p-10 text-center text-sm text-brand-muted">
          Nothing waiting on review. Run ingestion from the Sources page, or add an entry by URL.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-brand-muted/20 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <DomainBadge domain={entry.domain} />
                    <ScoreDots score={entry.qualityScore} />
                    <span className="text-xs text-brand-muted">
                      ~{estimateReadTime(entry.finding, entry.whyItMatters)} min brief
                    </span>
                    {!entry.credibleFlag && (
                      <span className="rounded-full border border-brand-cta/30 bg-brand-cta/10 px-2 py-0.5 text-xs font-medium text-brand-cta">
                        credibility flagged
                      </span>
                    )}
                  </div>
                  <Link href={`/entries/${entry.id}`} className="font-semibold text-brand-ink hover:underline">
                    {entry.title}
                  </Link>
                  <p className="text-xs text-brand-muted">
                    {[entry.org, entry.publication].filter(Boolean).join(" · ")}
                  </p>
                  <p className="max-w-3xl text-sm text-brand-ink/90">{entry.finding}</p>
                  {entry.whyItMatters && (
                    <p className="max-w-3xl text-xs text-brand-muted">{entry.whyItMatters}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <EntryActionBar
                    id={entry.id}
                    status={entry.status}
                    liked={entry.liked}
                    used={!!entry.usedAt}
                    variant="compact"
                  />
                  <Link href={`/entries/${entry.id}`} className="text-xs text-brand-muted hover:text-brand-ink">
                    Edit first
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

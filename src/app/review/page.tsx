import Link from "next/link";
import { EntryStatus } from "@/lib/enums";
import { prisma } from "@/lib/db";
import DomainBadge from "@/components/DomainBadge";
import ScoreDots from "@/components/ScoreDots";
import { approveEntryAction, rejectEntryAction } from "@/lib/actions";

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
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Review queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Automation pulled these in and curation judged them credible and quality &ge; 3, but
          nothing goes on the dashboard without a human looking at it first.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Nothing waiting on review. Run ingestion from the Sources page, or add an entry by URL.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <DomainBadge domain={entry.domain} />
                    <ScoreDots score={entry.qualityScore} />
                    {!entry.credibleFlag && (
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                        credibility flagged
                      </span>
                    )}
                  </div>
                  <Link href={`/entries/${entry.id}`} className="font-semibold text-ink hover:underline">
                    {entry.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {[entry.org, entry.publication].filter(Boolean).join(" · ")}
                  </p>
                  <p className="max-w-3xl text-sm text-slate-700">{entry.finding}</p>
                  {entry.whyItMatters && (
                    <p className="max-w-3xl text-xs text-slate-500">{entry.whyItMatters}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <form action={approveEntryAction}>
                    <input type="hidden" name="id" value={entry.id} />
                    <button className="w-full rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">
                      Approve
                    </button>
                  </form>
                  <form action={rejectEntryAction}>
                    <input type="hidden" name="id" value={entry.id} />
                    <button className="w-full rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300">
                      Reject
                    </button>
                  </form>
                  <Link href={`/entries/${entry.id}`} className="text-center text-xs text-slate-400 hover:text-slate-600">
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

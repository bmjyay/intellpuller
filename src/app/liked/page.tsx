import { prisma } from "@/lib/db";
import { buildEntryWhere } from "@/lib/entryQuery";
import FilterBar from "@/components/FilterBar";
import EntryCard from "@/components/EntryCard";

export const dynamic = "force-dynamic";

type SearchParams = { domain?: string; q?: string; sort?: string; hideUsed?: string };

export default async function LikedPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { domain, q, sort, hideUsed } = await searchParams;

  const where = buildEntryWhere({
    status: "ALL",
    liked: true,
    domain,
    q,
    used: hideUsed === "true" ? "hide" : undefined,
  });

  const entries = await prisma.entry.findMany({
    where,
    orderBy: sort === "score" ? { qualityScore: "desc" } : { publishedAt: "desc" },
    include: { patterns: true, source: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Liked</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Entries starred as interesting -- a shortlist to pull from when putting a brief
          together. Includes items still in review as well as approved ones.
        </p>
      </div>

      <FilterBar domain={domain} q={q} sort={sort} hideUsed={hideUsed === "true"} clearHref="/liked" />

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-muted/30 p-10 text-center text-sm text-brand-muted">
          Nothing liked yet -- hit the &ldquo;Like&rdquo; button on any entry to add it here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, i) => (
            <EntryCard key={entry.id} entry={entry} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

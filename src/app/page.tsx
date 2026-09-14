import { EntryStatus } from "@/lib/enums";
import { prisma } from "@/lib/db";
import { buildEntryWhere } from "@/lib/entryQuery";
import FilterBar from "@/components/FilterBar";
import EntryCard from "@/components/EntryCard";

export const dynamic = "force-dynamic";

type SearchParams = { domain?: string; q?: string; sort?: string; pattern?: string; hideUsed?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { domain, q, sort, pattern, hideUsed } = await searchParams;

  const where = buildEntryWhere({
    status: EntryStatus.APPROVED,
    domain,
    pattern,
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
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Feed</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Exceptional, human-reviewed research and reporting on how AI affects trust, cognition,
          labor, and security.
          {pattern && (
            <>
              {" "}
              Filtered to pattern <span className="font-medium text-brand-ink/80">&ldquo;{pattern}&rdquo;</span>.
            </>
          )}
        </p>
      </div>

      <FilterBar domain={domain} q={q} sort={sort} pattern={pattern} hideUsed={hideUsed === "true"} />

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-muted/30 p-10 text-center text-sm text-brand-muted">
          No approved entries match these filters yet. Check the review queue, or add one directly.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

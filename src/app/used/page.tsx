import { prisma } from "@/lib/db";
import { buildEntryWhere } from "@/lib/entryQuery";
import FilterBar from "@/components/FilterBar";
import EntryCard from "@/components/EntryCard";

export const dynamic = "force-dynamic";

type SearchParams = { domain?: string; q?: string; sort?: string };

export default async function UsedPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { domain, q, sort } = await searchParams;

  const where = buildEntryWhere({ status: "ALL", used: "only", domain, q });

  const entries = await prisma.entry.findMany({
    where,
    orderBy: sort === "score" ? { qualityScore: "desc" } : { usedAt: "desc" },
    include: { patterns: true, source: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Used</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Entries already worked into a brief -- crossed off the live feed so the team doesn't
          keep re-reading them. Unmark one here to send it back to the dashboard.
        </p>
      </div>

      <FilterBar domain={domain} q={q} sort={sort} clearHref="/used" showUsedToggle={false} />

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-muted/30 p-10 text-center text-sm text-brand-muted">
          Nothing marked used yet -- hit the duplicate/&ldquo;used&rdquo; icon on any entry once
          it's gone into a brief.
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

import { Prisma } from "@prisma/client";
import { Domain, EntryStatus } from "@/lib/enums";
import { prisma } from "@/lib/db";
import { ALL_DOMAINS } from "@/lib/domains";
import FilterBar from "@/components/FilterBar";
import EntryCard from "@/components/EntryCard";

export const dynamic = "force-dynamic";

type SearchParams = { domain?: string; q?: string; sort?: string; pattern?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { domain, q, sort, pattern } = await searchParams;

  const where: Prisma.EntryWhereInput = { status: EntryStatus.APPROVED };
  if (domain && ALL_DOMAINS.includes(domain as Domain)) where.domain = domain as Domain;
  if (pattern) where.patterns = { some: { name: pattern } };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { finding: { contains: q } },
      { whyItMatters: { contains: q } },
      { authors: { contains: q } },
      { org: { contains: q } },
    ];
  }

  const entries = await prisma.entry.findMany({
    where,
    orderBy: sort === "score" ? { qualityScore: "desc" } : { publishedAt: "desc" },
    include: { patterns: true, source: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Feed</h1>
        <p className="mt-1 text-sm text-slate-500">
          Exceptional, human-reviewed research and reporting on how AI affects trust, cognition,
          labor, and security.
          {pattern && (
            <>
              {" "}
              Filtered to pattern <span className="font-medium text-slate-700">&ldquo;{pattern}&rdquo;</span>.
            </>
          )}
        </p>
      </div>

      <FilterBar domain={domain} q={q} sort={sort} pattern={pattern} />

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
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

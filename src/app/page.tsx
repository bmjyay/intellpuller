import Image from "next/image";
import { EntryStatus } from "@/lib/enums";
import { prisma } from "@/lib/db";
import { buildEntryWhere } from "@/lib/entryQuery";
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

  // Used entries have their own home (Manage > Used) -- the live feed
  // never shows them, so there's no "hide used" toggle to manage here.
  const where = buildEntryWhere({
    status: EntryStatus.APPROVED,
    domain,
    pattern,
    q,
    used: "hide",
  });

  const entries = await prisma.entry.findMany({
    where,
    orderBy: sort === "score" ? { qualityScore: "desc" } : { publishedAt: "desc" },
    include: { patterns: true, source: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="relative h-56 overflow-hidden rounded-2xl sm:h-64">
        <Image
          src="/images/dashboard-hero.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover object-[center_90%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Exceptional AI research, curated
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/80">
            Human-reviewed findings on how AI affects trust, cognition, labor, and security.
            {pattern && (
              <>
                {" "}
                Filtered to pattern <span className="font-medium text-white">&ldquo;{pattern}&rdquo;</span>.
              </>
            )}
          </p>
        </div>
      </div>

      <FilterBar domain={domain} q={q} sort={sort} pattern={pattern} showUsedToggle={false} />

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-muted/30 p-10 text-center text-sm text-brand-muted">
          No approved entries match these filters yet. Check the review queue, or add one directly.
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

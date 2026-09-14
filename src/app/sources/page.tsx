import { prisma } from "@/lib/db";
import RunIngestButton from "@/components/RunIngestButton";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Sources</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Where automated pulls come from. Non-automatable outlets (no reliable feed, e.g.
            Wharton/HBR) show up here for reference but only get new entries via Add entry.
          </p>
        </div>
        <RunIngestButton />
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-muted/20 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-muted/20 bg-brand-bg text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Org</th>
              <th className="px-4 py-3">Entries</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-brand-muted/10 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-ink">{s.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-periwinkle/50 px-2 py-0.5 text-xs">{s.kind}</span>
                </td>
                <td className="px-4 py-3 text-brand-ink/80">{s.org ?? "—"}</td>
                <td className="px-4 py-3 text-brand-ink/80">{s._count.entries}</td>
                <td className="px-4 py-3 text-xs text-brand-muted">{s.notes ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-brand-muted">
        Add new sources via <code className="rounded bg-brand-periwinkle/40 px-1">POST /api/sources</code> --
        an RSS feed URL for a lab blog, or an arXiv query string. Manual-only outlets can be
        added the same way with <code className="rounded bg-brand-periwinkle/40 px-1">kind: "MANUAL"</code>.
      </p>
    </div>
  );
}

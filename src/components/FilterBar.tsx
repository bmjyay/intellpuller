import { ALL_DOMAINS, DOMAIN_LABELS } from "@/lib/domains";

type Props = {
  domain?: string;
  q?: string;
  sort?: string;
  pattern?: string;
};

export default function FilterBar({ domain, q, sort, pattern }: Props) {
  return (
    <form className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" method="get">
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder="Search title, finding, authors..."
        className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-ink"
      />

      <select
        name="domain"
        defaultValue={domain ?? ""}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-ink"
      >
        <option value="">All domains</option>
        {ALL_DOMAINS.map((d) => (
          <option key={d} value={d}>
            {DOMAIN_LABELS[d]}
          </option>
        ))}
      </select>

      <select
        name="sort"
        defaultValue={sort ?? "recent"}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-ink"
      >
        <option value="recent">Newest first</option>
        <option value="score">Highest quality first</option>
      </select>

      {pattern && <input type="hidden" name="pattern" value={pattern} />}

      <button
        type="submit"
        className="rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Filter
      </button>

      {(domain || q || pattern) && (
        <a href="/" className="text-sm text-slate-400 hover:text-slate-600">
          Clear
        </a>
      )}
    </form>
  );
}

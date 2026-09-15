import { ALL_DOMAINS, DOMAIN_LABELS } from "@/lib/domains";

type Props = {
  domain?: string;
  q?: string;
  sort?: string;
  pattern?: string;
  hideUsed?: boolean;
  clearHref?: string;
  // Off on pages where "used" isn't a relevant axis to filter -- the
  // dashboard excludes used entries outright (no toggle needed), and the
  // Used page *is* the used entries (nothing to hide).
  showUsedToggle?: boolean;
};

export default function FilterBar({
  domain,
  q,
  sort,
  pattern,
  hideUsed,
  clearHref = "/",
  showUsedToggle = true,
}: Props) {
  return (
    <form className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-muted/25 bg-white p-4 shadow-sm" method="get">
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder="Search title, finding, authors..."
        className="input min-w-[220px] flex-1"
      />

      <select name="domain" defaultValue={domain ?? ""} className="input">
        <option value="">All domains</option>
        {ALL_DOMAINS.map((d) => (
          <option key={d} value={d}>
            {DOMAIN_LABELS[d]}
          </option>
        ))}
      </select>

      <select name="sort" defaultValue={sort ?? "recent"} className="input">
        <option value="recent">Newest first</option>
        <option value="score">Highest quality first</option>
      </select>

      {showUsedToggle && (
        <label className="flex items-center gap-1.5 text-sm text-brand-ink/80">
          <input type="checkbox" name="hideUsed" value="true" defaultChecked={hideUsed} className="accent-brand-accent" />
          Hide used
        </label>
      )}

      {pattern && <input type="hidden" name="pattern" value={pattern} />}

      <button
        type="submit"
        className="rounded-md bg-brand-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-ink"
      >
        Filter
      </button>

      {(domain || q || pattern || hideUsed) && (
        <a href={clearHref} className="text-sm text-brand-muted hover:text-brand-ink">
          Clear
        </a>
      )}
    </form>
  );
}

import { addEntryByUrlAction } from "@/lib/actions";

export default function AddEntryPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Add an entry</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste a URL to a paper, report, or article. It will be fetched and run through the same
          curation the automated pull uses, then land in the review queue so you can edit before
          approving.
        </p>
      </div>

      <form action={addEntryByUrlAction} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-600">URL</span>
          <input
            type="url"
            name="url"
            required
            placeholder="https://www.nber.org/papers/w..."
            className="input"
          />
        </label>
        <button type="submit" className="self-start rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Fetch &amp; curate
        </button>
      </form>

      <p className="text-xs text-slate-400">
        Curation calls the configured Anthropic model to extract metadata, write the finding
        summary, assign a domain, and score quality/credibility -- it can take a few seconds.
      </p>
    </div>
  );
}

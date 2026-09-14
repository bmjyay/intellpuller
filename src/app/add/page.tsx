import AddEntryForm from "@/components/AddEntryForm";

export default function AddEntryPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Add an entry</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Paste a URL to a paper, report, or article. It will be fetched and run through the same
          curation the automated pull uses, then land in the review queue so you can edit before
          approving.
        </p>
      </div>

      <AddEntryForm />

      <p className="text-xs text-brand-muted">
        Curation calls the configured Anthropic model to extract metadata, write the finding
        summary, assign a domain, and score quality/credibility -- it can take a few seconds.
      </p>
    </div>
  );
}

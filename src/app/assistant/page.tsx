import ChatPanel from "@/components/ChatPanel";

export default function AssistantPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Assistant</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Ask for a brief, a summary, or a citation. It only writes from entries already approved
          in the corpus (or your liked shortlist) -- it won't invent a source.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}

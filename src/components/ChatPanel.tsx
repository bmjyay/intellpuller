"use client";

import { useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

// Renders the assistant's markdown-style [label](url) citations as real
// links; everything else stays plain text (no need for a full markdown
// dependency for this).
function renderContent(text: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(
      <a key={key++} href={match[2]} target="_blank" rel="noreferrer" className="font-medium text-brand-primary hover:underline">
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [scope, setScope] = useState<"all" | "liked">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, scope }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setMessages([...next, { role: "assistant", content: data.reply }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-brand-muted/25 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-brand-muted/20 px-4 py-3">
        <p className="text-sm text-brand-muted">Grounded only in entries already in the corpus.</p>
        <label className="flex items-center gap-1.5 text-xs text-brand-ink/80">
          <input
            type="checkbox"
            checked={scope === "liked"}
            onChange={(e) => setScope(e.target.checked ? "liked" : "all")}
            className="accent-brand-accent"
          />
          Only liked entries
        </label>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-brand-muted">
            Try: &ldquo;Draft a 3-bullet brief on AI sycophancy findings, with citations&rdquo; or
            &ldquo;What do we have on entry-level hiring?&rdquo;
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm leading-relaxed ${
                m.role === "user" ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-ink"
              }`}
            >
              {renderContent(m.content)}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-brand-muted">Thinking...</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-brand-muted/20 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a brief, a summary, or citations..."
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-brand-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-ink disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddEntryForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, addedBy: "manual" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 && data.entry?.id) {
          router.push(`/entries/${data.entry.id}`);
          return;
        }
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      router.push(`/entries/${data.entry.id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-brand-muted/20 bg-white p-6 shadow-sm">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-brand-ink/80">URL</span>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.nber.org/papers/w..."
          className="input"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-ink disabled:opacity-50"
      >
        {loading ? "Fetching & curating..." : "Fetch & curate"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IngestReport } from "@/lib/ingest";

export default function RunIngestButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<IngestReport | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setReport(data.report);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-ink disabled:opacity-50"
      >
        {loading ? "Running ingestion..." : "Run ingestion now"}
      </button>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {report && (
        <p className="text-xs text-brand-muted">
          {report.candidatesFound} candidate(s) seen, {report.curated} curated,{" "}
          {report.skippedExisting} already known
          {report.failed.length > 0 ? `, ${report.failed.length} source(s) failed` : ""}.
        </p>
      )}
    </div>
  );
}

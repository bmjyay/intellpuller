import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ALL_DOMAINS, DOMAIN_LABELS } from "@/lib/domains";
import DomainBadge from "@/components/DomainBadge";
import PatternPill from "@/components/PatternPill";
import {
  approveEntryAction,
  rejectEntryAction,
  archiveEntryAction,
  deleteEntryAction,
  updateEntryAction,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { patterns: true, source: true },
  });
  if (!entry) notFound();

  const dateInput = entry.publishedAt ? entry.publishedAt.toISOString().slice(0, 10) : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DomainBadge domain={entry.domain} />
          <StatusPill status={entry.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          {entry.status !== "APPROVED" && (
            <form action={approveEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <ActionButton kind="approve">Approve</ActionButton>
            </form>
          )}
          {entry.status !== "REJECTED" && (
            <form action={rejectEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <ActionButton kind="reject">Reject</ActionButton>
            </form>
          )}
          {entry.status === "APPROVED" && (
            <form action={archiveEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <ActionButton kind="neutral">Archive</ActionButton>
            </form>
          )}
          <form action={deleteEntryAction}>
            <input type="hidden" name="id" value={entry.id} />
            <ActionButton kind="danger">Delete</ActionButton>
          </form>
        </div>
      </div>

      <a
        href={entry.url}
        target="_blank"
        rel="noreferrer"
        className="text-xs font-medium text-blue-700 hover:underline"
      >
        {entry.url} &rarr;
      </a>

      {entry.patterns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.patterns.map((p) => (
            <PatternPill key={p.id} name={p.name} />
          ))}
        </div>
      )}

      <form action={updateEntryAction} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={entry.id} />

        <Field label="Title">
          <input name="title" defaultValue={entry.title} className="input" required />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Authors">
            <input name="authors" defaultValue={entry.authors ?? ""} className="input" />
          </Field>
          <Field label="Org">
            <input name="org" defaultValue={entry.org ?? ""} className="input" />
          </Field>
          <Field label="Publication">
            <input name="publication" defaultValue={entry.publication ?? ""} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Domain">
            <select name="domain" defaultValue={entry.domain} className="input">
              {ALL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_LABELS[d]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quality score (1-5)">
            <input
              type="number"
              name="qualityScore"
              min={1}
              max={5}
              defaultValue={entry.qualityScore ?? ""}
              className="input"
            />
          </Field>
        </div>

        <Field label="Finding">
          <textarea name="finding" defaultValue={entry.finding} rows={3} className="input" required />
        </Field>

        <Field label="Why it matters (optional)">
          <textarea name="whyItMatters" defaultValue={entry.whyItMatters ?? ""} rows={2} className="input" />
        </Field>

        <div>
          <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Save changes
          </button>
        </div>
      </form>

      <details className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <summary className="cursor-pointer select-none font-medium text-slate-600">
          Audit trail &amp; raw source excerpt
        </summary>
        <dl className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
          <dt className="text-slate-400">Added by</dt>
          <dd>{entry.addedBy ?? "unknown"}</dd>
          <dt className="text-slate-400">Reviewed by</dt>
          <dd>{entry.reviewedBy ?? "—"}</dd>
          <dt className="text-slate-400">Published</dt>
          <dd>{dateInput || "—"}</dd>
          <dt className="text-slate-400">Credible flag (from curation)</dt>
          <dd>{entry.credibleFlag ? "yes" : "no"}</dd>
          <dt className="text-slate-400">Source</dt>
          <dd>{entry.source?.name ?? "manual"}</dd>
        </dl>
        {entry.rawExcerpt && (
          <p className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 leading-relaxed">{entry.rawExcerpt}</p>
        )}
      </details>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-slate-100 text-slate-500 border-slate-200",
    ARCHIVED: "bg-slate-100 text-slate-400 border-slate-200",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>{status}</span>
  );
}

function ActionButton({ kind, children }: { kind: "approve" | "reject" | "neutral" | "danger"; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    approve: "bg-emerald-600 hover:bg-emerald-500 text-white",
    reject: "bg-slate-200 hover:bg-slate-300 text-slate-700",
    neutral: "bg-slate-200 hover:bg-slate-300 text-slate-700",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
  };
  return (
    <button type="submit" className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${styles[kind]}`}>
      {children}
    </button>
  );
}

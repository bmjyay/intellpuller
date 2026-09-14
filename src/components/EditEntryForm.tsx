"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_DOMAINS, DOMAIN_LABELS } from "@/lib/domains";
import type { Domain } from "@/lib/enums";

type Props = {
  id: string;
  title: string;
  authors: string;
  org: string;
  publication: string;
  domain: string;
  qualityScore: number | "";
  finding: string;
  whyItMatters: string;
};

export default function EditEntryForm(props: Props) {
  const router = useRouter();
  const [values, setValues] = useState(props);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Props>(key: K, value: Props[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/entries/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          authors: values.authors,
          org: values.org,
          publication: values.publication,
          domain: values.domain,
          qualityScore: values.qualityScore === "" ? null : Number(values.qualityScore),
          finding: values.finding,
          whyItMatters: values.whyItMatters,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed (${res.status})`);
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-brand-muted/20 bg-white p-6 shadow-sm">
      <Field label="Title">
        <input value={values.title} onChange={(e) => set("title", e.target.value)} className="input" required />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Authors">
          <input value={values.authors} onChange={(e) => set("authors", e.target.value)} className="input" />
        </Field>
        <Field label="Org">
          <input value={values.org} onChange={(e) => set("org", e.target.value)} className="input" />
        </Field>
        <Field label="Publication">
          <input value={values.publication} onChange={(e) => set("publication", e.target.value)} className="input" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Domain">
          <select value={values.domain} onChange={(e) => set("domain", e.target.value)} className="input">
            {ALL_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABELS[d as Domain]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quality score (1-5)">
          <input
            type="number"
            min={1}
            max={5}
            value={values.qualityScore}
            onChange={(e) => set("qualityScore", e.target.value === "" ? "" : Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      <Field label="Finding">
        <textarea value={values.finding} onChange={(e) => set("finding", e.target.value)} rows={3} className="input" required />
      </Field>

      <Field label="Why it matters (optional)">
        <textarea value={values.whyItMatters} onChange={(e) => set("whyItMatters", e.target.value)} rows={2} className="input" />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-ink disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && !saving && <span className="text-xs text-emerald-700">Saved.</span>}
        {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-brand-ink/80">{label}</span>
      {children}
    </label>
  );
}

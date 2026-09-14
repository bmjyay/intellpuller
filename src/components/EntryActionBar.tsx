"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EntryStatus } from "@/lib/enums";

type Props = {
  id: string;
  status: string;
  liked: boolean;
  used: boolean;
  // "full" = entry detail page (all actions). "compact" = review queue row
  // (approve/reject + toggles). "card" = dashboard/liked/archive cards
  // (just the like/used toggles -- status changes happen from the detail
  // page or review queue, not inline on a browsing card).
  variant?: "full" | "compact" | "card";
};

// Every mutation here hits the plain REST API (`/api/entries/:id`) over
// same-origin fetch rather than a Next.js Server Action -- Server Actions
// enforce an Origin-header match that a lot of internal-tool hosting setups
// (tunnels, reverse proxies, preview URLs) break silently, which is why the
// buttons on this page used to just... do nothing.
export default function EntryActionBar({ id, status, liked, used, variant = "full" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>, label: string) {
    setError(null);
    setBusy(label);
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm("Delete this entry? This can't be undone.")) return;
    setError(null);
    setBusy("delete");
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      // The "full" variant lives on an entry's own detail page -- once
      // deleted there's nothing left to render there, so leave. The
      // "compact" variant lives in a list (review queue) that just needs
      // to drop this row.
      if (variant === "full") router.push("/review");
      else startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const isBusy = (label: string) => busy === label || pending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleButton
          active={liked}
          busy={isBusy("liked")}
          activeLabel="♥ Liked"
          idleLabel="♡ Like"
          onClick={() => patch({ liked: !liked }, "liked")}
        />
        <ToggleButton
          active={used}
          busy={isBusy("used")}
          activeLabel="✓ Used"
          idleLabel="Mark used"
          onClick={() => patch({ used: !used }, "used")}
        />

        {variant !== "card" && status !== EntryStatus.APPROVED && (
          <ActionButton kind="approve" busy={isBusy("approve")} onClick={() => patch({ status: EntryStatus.APPROVED }, "approve")}>
            Approve
          </ActionButton>
        )}
        {variant !== "card" && status !== EntryStatus.REJECTED && (
          <ActionButton kind="reject" busy={isBusy("reject")} onClick={() => patch({ status: EntryStatus.REJECTED }, "reject")}>
            Reject
          </ActionButton>
        )}
        {variant === "full" && status === EntryStatus.APPROVED && (
          <ActionButton kind="neutral" busy={isBusy("archive")} onClick={() => patch({ status: EntryStatus.ARCHIVED }, "archive")}>
            Archive
          </ActionButton>
        )}
        {variant === "full" && (
          <ActionButton kind="danger" busy={isBusy("delete")} onClick={remove}>
            Delete
          </ActionButton>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function ToggleButton({
  active,
  busy,
  activeLabel,
  idleLabel,
  onClick,
}: {
  active: boolean;
  busy: boolean;
  activeLabel: string;
  idleLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
        active
          ? "border-brand-accent bg-brand-accent/10 text-brand-ink"
          : "border-brand-muted/30 bg-white text-brand-muted hover:border-brand-accent"
      }`}
    >
      {active ? activeLabel : idleLabel}
    </button>
  );
}

function ActionButton({
  kind,
  busy,
  onClick,
  children,
}: {
  kind: "approve" | "reject" | "neutral" | "danger";
  busy: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    approve: "bg-emerald-600 hover:bg-emerald-500 text-white",
    reject: "bg-brand-periwinkle/70 hover:bg-brand-periwinkle text-brand-ink",
    neutral: "bg-brand-periwinkle/70 hover:bg-brand-periwinkle text-brand-ink",
    danger: "bg-brand-cta hover:bg-brand-cta/90 text-white",
  };
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${styles[kind]}`}
    >
      {children}
    </button>
  );
}

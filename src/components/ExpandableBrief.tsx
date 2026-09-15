"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  entryId: string;
  twist?: string | null;
  whyItMatters?: string | null;
};

// "Read the full brief" either expands the twist/why-it-matters context
// inline (when there's something to expand) or, if curation didn't find
// either, just links to the entry's own detail page.
export default function ExpandableBrief({ entryId, twist, whyItMatters }: Props) {
  const [open, setOpen] = useState(false);
  const hasMore = Boolean(twist || whyItMatters);

  if (!hasMore) {
    return (
      <Link
        href={`/entries/${entryId}`}
        className="mt-auto rounded-md border border-brand-muted/40 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-muted transition hover:border-brand-ink hover:text-brand-ink"
      >
        Read the full brief
      </Link>
    );
  }

  return (
    <>
      {open && (
        <div className="flex flex-col gap-2 border-t border-brand-muted/15 pt-3 text-xs leading-relaxed text-brand-muted">
          {twist && (
            <p>
              <span className="font-semibold uppercase tracking-wide text-brand-ink/70">Twist. </span>
              {twist}
            </p>
          )}
          {whyItMatters && (
            <p>
              <span className="font-semibold uppercase tracking-wide text-brand-ink/70">Why it matters. </span>
              {whyItMatters}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-auto rounded-md border border-brand-muted/40 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-muted transition hover:border-brand-ink hover:text-brand-ink"
      >
        {open ? "Close" : "Read the full brief"}
      </button>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  entryId: string;
  twist?: string | null;
  whyItMatters?: string | null;
};

const TEXT = "#201f1d";
const DIVIDER = "rgba(32, 31, 29, 0.16)";

const toggleClass =
  "mt-auto block w-full rounded-sm border py-2.5 text-center text-[11px] uppercase transition hover:bg-[#b68235]/10 hover:border-[#b68235]/45";
const toggleStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontWeight: 600,
  letterSpacing: "0.14em",
  color: "#7d5411",
  borderColor: DIVIDER,
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: "74px 1fr" }}>
      <div
        className="pt-1 text-right text-[10.5px] uppercase"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.14em", color: "#7d5411" }}
      >
        {label}
      </div>
      <p className="text-[14.5px] leading-[1.62]" style={{ fontFamily: "var(--font-body)", color: TEXT }}>
        {value}
      </p>
    </div>
  );
}

// "Read the full brief" either expands the twist/ground-truth context
// inline (when there's something to expand) or, if curation didn't find
// either, just links to the entry's own detail page.
export default function ExpandableBrief({ entryId, twist, whyItMatters }: Props) {
  const [open, setOpen] = useState(false);
  const hasMore = Boolean(twist || whyItMatters);

  if (!hasMore) {
    return (
      <Link href={`/entries/${entryId}`} className={toggleClass} style={toggleStyle}>
        Read the full brief
      </Link>
    );
  }

  return (
    <>
      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t pt-4" style={{ borderColor: DIVIDER }}>
          {twist && <Field label="Twist" value={twist} />}
          {whyItMatters && <Field label="Ground truth" value={whyItMatters} />}
        </div>
      )}
      <button type="button" onClick={() => setOpen((v) => !v)} className={toggleClass} style={toggleStyle}>
        {open ? "Close" : "Read the full brief"}
      </button>
    </>
  );
}

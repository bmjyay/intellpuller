import Link from "next/link";
import type { EntryWithRelations } from "@/lib/types";
import { estimateReadTime } from "@/lib/readtime";
import { DOMAIN_LABELS } from "@/lib/domains";
import type { Domain } from "@/lib/enums";
import { cardHeading, cardBody } from "@/lib/cardFonts";
import EntryActionBar from "./EntryActionBar";
import ExpandableBrief from "./ExpandableBrief";
import StatusPill from "./StatusPill";

// "Classical" card design (Research Card, variant 1c) with a dark navy
// finish in place of its original near-black header.
const HEADER_BG = "#141a2c";
const HEADER_TITLE = "#f6f4f1";
const HEADER_BYLINE = "rgba(243, 242, 242, 0.62)";
const ACCENT = "#b68235";
const ACCENT_300 = "#facb8d";
const TEXT = "#201f1d";
const DIVIDER = "rgba(32, 31, 29, 0.16)";

function formatYear(d: Date | null): string | null {
  return d ? new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(d) : null;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const year = formatYear(entry.publishedAt);
  const readMins = estimateReadTime(entry.finding, entry.twist, entry.whyItMatters);
  const used = !!entry.usedAt;
  const eyebrow = ["Evidence", ...DOMAIN_LABELS[entry.domain as Domain].split(" / ")].join(" · ");

  const dropCap = entry.finding.slice(0, 1);
  const findingRest = entry.finding.slice(1);

  return (
    <article
      className={`${cardHeading.variable} ${cardBody.variable} group flex h-full flex-col overflow-hidden rounded border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
      style={{ borderColor: DIVIDER, borderRadius: 4 }}
    >
      {/* Header */}
      <header className="px-7 pb-[22px] pt-6" style={{ background: HEADER_BG }}>
        <div className="flex items-start justify-between gap-3">
          <p
            className="text-[10px] uppercase"
            style={{ fontFamily: "var(--font-body)", letterSpacing: "0.2em", color: ACCENT_300 }}
          >
            {eyebrow}
          </p>
          <div className="flex flex-none items-center gap-2">
            {entry.status !== "APPROVED" && <StatusPill status={entry.status} />}
            <EntryActionBar id={entry.id} status={entry.status} liked={entry.liked} used={used} variant="card" tone="dark" />
          </div>
        </div>

        <Link
          href={`/entries/${entry.id}`}
          className="mt-4 block leading-[1.1] hover:underline"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 300,
            fontSize: 34,
            letterSpacing: "-0.01em",
            color: HEADER_TITLE,
          }}
        >
          {entry.title}
        </Link>

        <p className="mt-3.5 text-xs" style={{ fontFamily: "var(--font-body)", color: HEADER_BYLINE }}>
          {[year, entry.publication && <em key="pub">{entry.publication}</em>, entry.org]
            .filter(Boolean)
            .map((part, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {part}
              </span>
            ))}
          {" · "}~{readMins} min brief
        </p>
      </header>

      {/* Body */}
      <div className="flex flex-1 flex-col px-7 pt-6 pb-6">
        {entry.authors && (
          <p className="text-xs" style={{ fontFamily: "var(--font-body)", color: "rgba(32, 31, 29, 0.52)" }}>
            {entry.authors}
          </p>
        )}
        <hr className="my-4" style={{ borderColor: DIVIDER }} />

        <p
          className={`text-[15px] leading-[1.68] ${used ? "line-through" : ""}`}
          style={{ fontFamily: "var(--font-body)", color: TEXT, textDecorationColor: "rgba(32, 31, 29, 0.4)" }}
        >
          <span
            aria-hidden="true"
            className="float-left mr-2.5 mt-1"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 44, lineHeight: 0.82, color: ACCENT }}
          >
            {dropCap}
          </span>
          {findingRest}
        </p>

        <ExpandableBrief entryId={entry.id} twist={entry.twist} whyItMatters={entry.whyItMatters} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-7 py-3.5" style={{ borderTop: `1px solid ${DIVIDER}` }}>
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: TEXT }}
        >
          Source
        </a>
        <span
          className="text-[11px] uppercase"
          style={{ fontFamily: "var(--font-body)", letterSpacing: "0.06em", color: "rgba(32, 31, 29, 0.42)" }}
        >
          {hostname(entry.url)}
        </span>
      </div>
    </article>
  );
}

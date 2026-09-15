"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChatPanel from "./ChatPanel";

// A floating chat launcher, present on every page, so the assistant is
// reachable without spending a nav slot on it. The ring around the "a"
// mark is a spirograph bloom -- N same-size circles whose centers walk
// around a small circle -- built to match the brand's swirl artwork
// reference, with a slow-spinning color ring kept behind it.
export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panelRef}
          className="flex h-[32rem] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-brand-muted/25 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-brand-muted/20 px-4 py-3">
            <span className="font-semibold text-brand-ink">Assistant</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-full p-1 text-brand-muted transition hover:bg-brand-periwinkle/40 hover:text-brand-ink"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <ChatPanel />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="group relative flex h-24 w-24 items-center justify-center rounded-full"
      >
        {/* Slow-spinning color ring, kept from the earlier version */}
        <span
          aria-hidden="true"
          className="absolute inset-1 rounded-full opacity-70 blur-[2px] transition group-hover:opacity-90"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, #7884FF 12%, transparent 28%, transparent 50%, #FF4F01 62%, transparent 78%)",
            animation: "spin-slow 6s linear infinite",
          }}
        />

        <SpirographBloom className="absolute inset-0 drop-shadow-sm" />

        <span className="relative flex h-8 w-8 items-center justify-center rounded-[7px] border-2 border-white bg-brand-ink shadow-md">
          {open ? <CloseIcon light /> : <span className="font-serif text-base font-bold leading-none text-white">a</span>}
        </span>
      </button>
    </div>
  );
}

type Ring = { cx: number; cy: number; r: number; opacity: number };

function buildRing(n: number, r: number, d: number, opStart: number, opEnd: number, startDeg: number): Ring[] {
  const rings: Ring[] = [];
  const start = (startDeg * Math.PI) / 180;
  for (let i = 0; i < n; i++) {
    const ang = start + (2 * Math.PI * i) / n;
    rings.push({
      cx: 100 + d * Math.cos(ang),
      cy: 100 + d * Math.sin(ang),
      r,
      opacity: opStart + (opEnd - opStart) * (i / (n - 1)),
    });
  }
  return rings;
}

function SpirographBloom({ className }: { className?: string }) {
  // Computed once per mount -- cheap (80 circles), and identical every time.
  const outer = useMemo(() => buildRing(40, 58, 24, 0.2, 0.5, -30), []);
  const inner = useMemo(() => buildRing(40, 42, 22, 0.1, 0.95, -30), []);

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {outer.map((c, i) => (
        <circle key={`o${i}`} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="#a8a29e" strokeWidth={0.9} opacity={c.opacity} />
      ))}
      {inner.map((c, i) => (
        <circle key={`i${i}`} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="#0f0f12" strokeWidth={1.2} opacity={c.opacity} />
      ))}
    </svg>
  );
}

function CloseIcon({ light }: { light?: boolean }) {
  return (
    <svg width={light ? 16 : 18} height={light ? 16 : 18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke={light ? "white" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

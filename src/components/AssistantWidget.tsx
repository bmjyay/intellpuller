"use client";

import { useEffect, useRef, useState } from "react";
import ChatPanel from "./ChatPanel";

// A floating chat launcher, present on every page, so the assistant is
// reachable without spending a nav slot on it. Styled after the Andus
// icon mark (a dark square with the white "a") with a slow spiral-ring
// flourish behind it, echoing the brand's swirl artwork.
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
        className="group relative flex h-16 w-16 items-center justify-center"
      >
        {/* Spiral-ring flourish -- a slow-spinning conic gradient, nodding to
            the brand's swirl artwork without redrawing it at icon scale. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-70 transition group-hover:opacity-100"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, #7884FF 12%, transparent 28%, transparent 50%, #FF4F01 62%, transparent 78%)",
            animation: "spin-slow 6s linear infinite",
          }}
        />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-ink shadow-lg transition group-hover:bg-brand-primary">
          {open ? <CloseIcon light /> : <AndusMark />}
        </span>
      </button>
    </div>
  );
}

function AndusMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-white/70">
      <span className="font-serif text-sm font-bold leading-none text-white">a</span>
    </span>
  );
}

function CloseIcon({ light }: { light?: boolean }) {
  return (
    <svg width={light ? 20 : 18} height={light ? 20 : 18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke={light ? "white" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

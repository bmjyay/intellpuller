"use client";

import { useEffect, useRef, useState } from "react";
import ChatPanel from "./ChatPanel";

// A floating chat launcher, present on every page, so the assistant is
// reachable without spending a nav slot on it. Styled like the Andus
// icon mark -- a solid dark circle -- with a chat glyph instead of the
// "a" mark.
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-ink text-white shadow-lg transition hover:bg-brand-primary hover:scale-105"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H9l-4 4v-4H5.5C4.67 16 4 15.33 4 14.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <text x="12" y="12.5" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="currentColor">
        ?
      </text>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

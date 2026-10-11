"use client";

import { useEffect, useRef, useState } from "react";

// Accessible info trigger: keyboard (Enter/Space to open, Escape to
// close) and touch (tap toggles, tap elsewhere closes) both work —
// replaces a permanently-visible explanation paragraph with an on-demand
// one next to whatever metric/field it's explaining.
export default function InfoPopover({ label = "Про показник", children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" className="admin-info-btn" aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        i
      </button>
      {open ? (
        <div className="admin-popover" role="tooltip">
          {children}
        </div>
      ) : null}
    </span>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

// A small "⋮" dropdown for a list row's secondary actions — Poseidon's own
// crm-row-menu pattern (its leads list), generalized: each item is either
// a link (href) or an action (onClick), with an optional danger tone.
export default function RowMenu({ items, label = "Інші дії" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
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

  if (!items?.length) return null;

  return (
    <div className="crm-row-menu" ref={ref}>
      <button type="button" className="crm-row-menu-btn" aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {open ? (
        <div className="crm-row-menu-list" role="menu">
          {items.map((item, i) =>
            item.href ? (
              <a key={i} href={item.href} className="crm-row-menu-item" role="menuitem">
                {item.label}
              </a>
            ) : (
              <button
                key={i}
                type="button"
                className={`crm-row-menu-item${item.danger ? " is-danger" : ""}`}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}

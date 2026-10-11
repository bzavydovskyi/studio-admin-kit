"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../hooks/useFocusTrap.js";
import useLockBodyScroll from "../hooks/useLockBodyScroll.js";

// A centered confirm/entry dialog. Always rendered through a portal into
// document.body, never inline in the page tree — an inline position:fixed
// overlay can end up painted behind a position:sticky ancestor (the admin
// nav) regardless of z-index, a real cross-browser stacking quirk, not a
// specificity problem. Every modal library does this for the same reason.
export default function Modal({ onClose, children, labelledBy, maxWidth, className }) {
  const ref = useRef(null);
  useLockBodyScroll();
  useFocusTrap(ref, onClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`admin-modal${className ? ` ${className}` : ""}`}
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

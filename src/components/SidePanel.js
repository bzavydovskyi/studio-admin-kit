"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../hooks/useFocusTrap.js";
import useLockBodyScroll from "../hooks/useLockBodyScroll.js";

// A right-side slide-in detail panel (booking/lead/client detail, quick
// create). Same portal/focus-trap/body-lock plumbing as Modal — a panel is
// just a modal shaped differently, not a reason to re-solve scroll/focus
// from scratch again.
export default function SidePanel({ onClose, children, labelledBy, wide }) {
  const ref = useRef(null);
  useLockBodyScroll();
  useFocusTrap(ref, onClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="crm-panel-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`crm-panel${wide ? " crm-panel-wide" : ""}`}
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

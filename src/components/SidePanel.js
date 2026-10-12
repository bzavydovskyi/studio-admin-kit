"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../hooks/useFocusTrap.js";
import useLockBodyScroll from "../hooks/useLockBodyScroll.js";
import { PanelCloseContext } from "../hooks/usePanelClose.js";

// Matches --dur-med (see each app's theme file) — see Modal.js for why this
// is a plain constant rather than a transitionend listener.
const CLOSE_MS = 280;

// A right-side slide-in detail panel (booking/lead/client detail, quick
// create). Same portal/focus-trap/body-lock plumbing as Modal, plus the same
// enter/open/closing phase machine so its own exit transition (slide back
// out, not just fade) finishes before the parent actually unmounts it.
export default function SidePanel({ onClose, children, labelledBy, wide }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState("entering");
  const closingRef = useRef(false);
  useLockBodyScroll();

  useEffect(() => {
    const id = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(id);
  }, []);

  function requestClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setPhase("closing");
    window.setTimeout(() => onClose?.(), CLOSE_MS);
  }

  useFocusTrap(ref, requestClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`crm-panel-backdrop is-${phase}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
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
        <PanelCloseContext.Provider value={requestClose}>{children}</PanelCloseContext.Provider>
      </div>
    </div>,
    document.body
  );
}

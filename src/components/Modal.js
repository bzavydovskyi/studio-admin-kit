"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../hooks/useFocusTrap.js";
import useLockBodyScroll from "../hooks/useLockBodyScroll.js";
import { PanelCloseContext } from "../hooks/usePanelClose.js";

// Matches --dur-med (see each app's theme file) — kept as a plain constant
// rather than read from the CSS custom property so closing is reliable
// even if a transition never actually fires (prefers-reduced-motion drops
// the CSS transition entirely, so transitionend wouldn't either; a timer
// closes the modal correctly either way).
const CLOSE_MS = 280;

// A centered confirm/entry dialog. Always rendered through a portal into
// document.body, never inline in the page tree — an inline position:fixed
// overlay can end up painted behind a position:sticky ancestor (the admin
// nav) regardless of z-index, a real cross-browser stacking quirk, not a
// specificity problem. Every modal library does this for the same reason.
//
// Owns a tiny enter/open/closing phase machine so a close (Escape,
// backdrop click, the caller's own close button) gets to play its exit
// transition before the parent actually unmounts it — the parent's
// `onClose` prop fires only once that's done, same as it always has from
// the outside. A second close request while already closing is a no-op
// (the timer is already running), so a fast double-click/double-Escape
// can't queue up repeated exit animations.
export default function Modal({ onClose, children, labelledBy, maxWidth, className }) {
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
      className={`admin-modal-backdrop is-${phase}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
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
        <PanelCloseContext.Provider value={requestClose}>{children}</PanelCloseContext.Provider>
      </div>
    </div>,
    document.body
  );
}

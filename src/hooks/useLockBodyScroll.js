"use client";

import { useEffect } from "react";

// Shared by every full-screen modal/panel: without this, iOS Safari can
// route a touch-scroll gesture made inside the modal to the page behind
// it instead — the backdrop's own overflow-y: auto never gets the touch,
// so the modal looks completely frozen even though it's working fine.
// Pinning the body with `position: fixed` (not just `overflow: hidden`,
// which iOS Safari still lets scroll through) and restoring the exact
// scroll position on close is the standard fix.
export default function useLockBodyScroll() {
  useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);
}

"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);
let idSeq = 0;

// Mount once near the root of the admin layout. Children call useToast() to
// get a `show(message, { tone, duration })` function — never speculative:
// callers are expected to call it only once they have a real server
// confirmation (or a real error) in hand, not optimistically before a
// request resolves. Same entering→open→closing-then-removed shape as
// Modal/SidePanel's phase machine, just auto-triggered by a timer instead
// of a user close action.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, open: false } : t)));
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const show = useCallback(
    (message, { tone = "success", duration = 4000 } = {}) => {
      const id = ++idSeq;
      setToasts((list) => [...list, { id, message, tone, open: false }]);
      requestAnimationFrame(() => {
        setToasts((list) => list.map((t) => (t.id === id ? { ...t, open: true } : t)));
      });
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), duration)
      );
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="admin-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`admin-toast tone-${t.tone}${t.open ? " is-open" : ""}`} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default function useToast() {
  return useContext(ToastContext) || (() => {});
}

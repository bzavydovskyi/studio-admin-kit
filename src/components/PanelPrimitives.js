"use client";

import { useState } from "react";

// A titled subsection inside a SidePanel's body (.crm-section/.crm-section-title).
export function PanelSection({ title, children }) {
  return (
    <div className="crm-section">
      {title ? <p className="crm-section-title">{title}</p> : null}
      {children}
    </div>
  );
}

// A label/value line inside a PanelSection (.crm-row) — `strong` renders
// the value in bold; `highlight` tints it the accent color (the one or
// two numbers on a panel meant to draw the eye, e.g. "Залишок").
export function PanelRow({ label, value, strong, highlight }) {
  const Value = strong ? "strong" : "span";
  return (
    <div className={`crm-row${highlight ? " crm-row--highlight" : ""}`}>
      <span>{label}</span>
      <Value>{value}</Value>
    </div>
  );
}

// The small "{phone} · Картка клієнта" strip at the top of a booking panel.
export function ClientBadge({ children, linkHref, linkLabel = "Картка клієнта" }) {
  return (
    <div className="crm-client-badge">
      <span>{children}</span>
      {linkHref ? (
        <a href={linkHref} className="admin-btn outline small" style={{ fontSize: ".72rem", padding: ".4em .9em" }}>
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}

// "Додатково" — content hidden by default, one click away. Used for the
// low-priority fields (source, internal note, price-edit reason) nobody
// needs to see on every open.
export function Collapsible({ label = "Додатково", children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="crm-section">
      <button type="button" className="crm-collapsible-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
        {label}
      </button>
      {open ? <div style={{ marginTop: 8 }}>{children}</div> : null}
    </div>
  );
}

// The payment/refund ledger list + an inline "+ Додати оплату" form,
// inside a booking panel's "Оплата" section. `onSubmit({type, amount,
// method, comment})` is called with a validated positive integer amount;
// the caller owns the actual API call and reload.
const METHOD_OPTIONS = [
  { value: "cash", label: "Готівка" },
  { value: "card", label: "Картка" },
  { value: "transfer", label: "Переказ" },
];

export function PaymentLedger({ payments, onSubmit, busy, error, methodOptions = METHOD_OPTIONS, formatAmount, formatDate }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "payment", amount: "", method: methodOptions[0]?.value || "cash", comment: "" });

  async function submit(e) {
    e.preventDefault();
    const amount = parseInt(form.amount, 10);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await onSubmit({ type: form.type, amount, method: form.method, comment: form.comment || undefined });
    setForm((f) => ({ ...f, amount: "", comment: "" }));
    setOpen(false);
  }

  return (
    <>
      {payments?.length ? (
        <div className="crm-payment-list" style={{ marginTop: 12 }}>
          {payments.map((p) => (
            <div key={p.id} className={`crm-payment-row${p.type === "refund" ? " is-refund" : ""}`}>
              <span>
                {p.type === "refund" ? "−" : "+"}
                {formatAmount(p.amount)} · {methodOptions.find((m) => m.value === p.method)?.label || p.method}
              </span>
              <span className="crm-payment-meta">{formatDate(p.date)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {open ? (
        <form onSubmit={submit} style={{ marginTop: 12 }}>
          {error ? <div className="admin-alert error">{error}</div> : null}
          <div className="form-row admin-grid cols-2">
            <label className="admin-field">
              <span>Тип</span>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="payment">Оплата</option>
                <option value="refund">Повернення</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Сума</span>
              <input type="number" min="1" required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </label>
          </div>
          <div className="form-row admin-grid cols-2">
            <label className="admin-field">
              <span>Спосіб</span>
              <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}>
                {methodOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Коментар</span>
              <input value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="admin-btn small" disabled={busy}>{busy ? "Зберігаємо…" : "Зберегти"}</button>
            <button type="button" className="admin-btn ghost small" onClick={() => setOpen(false)}>Відмінити</button>
          </div>
        </form>
      ) : (
        <button className="admin-btn outline small" style={{ marginTop: 10 }} onClick={() => setOpen(true)}>+ Додати оплату</button>
      )}
    </>
  );
}

// The append-only action history at the bottom of a panel.
export function Timeline({ items, renderItem, formatTime }) {
  if (!items?.length) return null;
  return (
    <div className="crm-timeline">
      {items.map((item, i) => (
        <div key={item.id ?? i} className="crm-timeline-item">
          <span className="crm-timeline-time">{formatTime(item)}</span>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

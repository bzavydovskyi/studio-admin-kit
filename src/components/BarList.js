"use client";

// Horizontal-bar comparisons (popular services, request sources, lost
// reasons, ...) — Poseidon's own analytics page pattern, no charting
// library involved. `items` is [{key, label, count}]; pass `total` to
// also show each row's share of it, and `onClick` to make rows open a
// detail panel.
export default function BarList({ items, total, onClick }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="crm-bar-list">
      {items.map((item) => {
        const pct = Math.round((item.count / max) * 100);
        const share = total ? Math.round((item.count / total) * 100) : null;
        const content = (
          <>
            <span className="crm-bar-label">{item.label}</span>
            <span className="crm-bar-track">
              <span className="crm-bar-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="crm-bar-value">
              {item.count}
              {share != null ? <span className="crm-bar-share"> · {share}%</span> : null}
            </span>
          </>
        );
        return onClick ? (
          <button key={item.key} type="button" className="crm-bar-row crm-bar-row--clickable" onClick={() => onClick(item)}>
            {content}
          </button>
        ) : (
          <div key={item.key} className="crm-bar-row">
            {content}
          </div>
        );
      })}
    </div>
  );
}

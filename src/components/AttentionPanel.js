"use client";

import SidePanel from "./SidePanel.js";

// The "needs attention" tile grid for a Today/Overview screen. `tiles` is
// caller-defined — the only business-specific part (which categories
// exist, their counts/hints) lives in the consuming app; this component
// only knows how to lay a tile grid out and report which one was clicked.
export function AttentionTiles({ tiles, onSelect }) {
  return (
    <div className="crm-attention-grid">
      {tiles.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`crm-attention-tile${t.tone ? ` tone-${t.tone}` : ""}`}
          onClick={() => onSelect?.(t.key)}
        >
          {t.icon ? <span className="crm-attention-tile-icon">{t.icon}</span> : null}
          <span className="crm-attention-tile-count">{t.count}</span>
          <span className="crm-attention-tile-label">{t.label}</span>
          {t.hint ? <span className="crm-attention-tile-hint">{t.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}

// The on-demand detail panel a tile opens — fetched lazily by the caller
// (never preloaded for every tile up front), rendered via SidePanel.
// `renderItem(item, index)` is a render-prop so the actual item shape
// (lead vs. booking vs. anything else) stays the caller's concern.
export function AttentionDetailPanel({
  title,
  subtitle,
  items,
  loading,
  error,
  emptyText = "Нічого немає.",
  onClose,
  renderItem,
  onRetry,
}) {
  return (
    <SidePanel onClose={onClose} labelledBy="attention-panel-title">
      <div className="crm-panel-head">
        <div>
          <h3 id="attention-panel-title">{title}</h3>
          {subtitle ? <p className="crm-panel-sub">{subtitle}</p> : null}
        </div>
        <button type="button" className="crm-panel-close" aria-label="Закрити" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="crm-panel-body">
        {loading ? (
          <p className="admin-hint">Завантаження…</p>
        ) : error ? (
          <div className="admin-alert error">
            {error}
            {onRetry ? (
              <button type="button" className="admin-btn outline small" style={{ marginLeft: 8 }} onClick={onRetry}>
                Повторити
              </button>
            ) : null}
          </div>
        ) : !items?.length ? (
          <p className="crm-attention-empty">{emptyText}</p>
        ) : (
          <div className="admin-list">{items.map((item, i) => renderItem(item, i))}</div>
        )}
      </div>
    </SidePanel>
  );
}

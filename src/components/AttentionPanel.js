"use client";

import SidePanel from "./SidePanel.js";
import usePanelClose from "../hooks/usePanelClose.js";

// The "Потребують уваги" tile grid for a Today/Overview screen — exact
// class names/values from Poseidon's own .crm-attn-grid/.crm-attn-tile.
// `tiles` is caller-defined: which categories exist, their counts/hints,
// is the only business-specific part; this component only knows how to
// lay a tile grid out and report which one was clicked.
export function AttentionTiles({ tiles, onSelect }) {
  const allClear = tiles.every((t) => !t.count);
  if (allClear) return <p className="crm-attention-empty">Немає дій, що потребують уваги.</p>;
  return (
    <div className="crm-attn-grid">
      {tiles.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`crm-attn-tile${t.count ? ` is-${t.tone}` : ""}`}
          onClick={() => onSelect?.(t.key)}
        >
          <span className="crm-attn-tile-top">
            {t.icon ? <span className="crm-attn-tile-icon">{t.icon}</span> : null}
            <span className="crm-attn-tile-label">{t.label}</span>
          </span>
          <span className="crm-attn-tile-count">{t.count}</span>
          {t.hint ? <span className="crm-attn-tile-hint">{t.hint}</span> : null}
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
      <AttentionDetailBody
        title={title}
        subtitle={subtitle}
        items={items}
        loading={loading}
        error={error}
        emptyText={emptyText}
        renderItem={renderItem}
        onRetry={onRetry}
      />
    </SidePanel>
  );
}

function AttentionDetailBody({ title, subtitle, items, loading, error, emptyText, renderItem, onRetry }) {
  const requestClose = usePanelClose();
  return (
    <>
      <div className="crm-panel-head">
        <div>
          <h3 id="attention-panel-title">{title}</h3>
          {subtitle ? <p className="crm-panel-sub">{subtitle}</p> : null}
        </div>
        <button type="button" className="crm-panel-close" aria-label="Закрити" onClick={requestClose}>
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
    </>
  );
}

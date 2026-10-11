// Pure presentational — no hooks, safe as a plain function used from
// either a Server or Client Component tree.
//
// `change`/`changeTone` render a small delta line under the value (e.g.
// period-over-period comparison on an analytics page); omit both for a
// plain stat card.
export default function StatCard({ label, value, info, change, changeTone = "neutral", compact }) {
  return (
    <div className={`crm-stat-card${compact ? " crm-stat-card--compact" : ""}`}>
      <p className="crm-stat-card-label">
        {label}
        {info ? <span className="crm-stat-card-info">{info}</span> : null}
      </p>
      <p className="crm-stat-card-value">{value}</p>
      {change != null ? <p className={`crm-stat-card-change is-${changeTone}`}>{change}</p> : null}
    </div>
  );
}

// The "Далі сьогодні" / "Минулі — потребують завершення" row list —
// time, name, format/summary, amount, status, and an open-chevron, one
// row per booking-like item. `rows` already carry everything to display;
// this component only lays them out and wires the click.
//
// row shape: { id, key?, time, name, format, amountMain, amountNote,
//   status: {label, tone}, tone? ("current"|"next"|"past"), wide?,
//   actions? (JSX rendered instead of the chevron, stops row click) }
export default function ScheduleList({ rows, onRowClick, emptyText }) {
  if (!rows?.length) return <div className="crm-sched-empty"><p>{emptyText}</p></div>;
  return (
    <div className="crm-sched-list">
      {rows.map((r) => (
        <div
          key={r.key ?? r.id}
          className={`crm-sched-row${r.wide ? " crm-sched-row--upcoming" : ""}${r.tone ? ` is-${r.tone}` : ""}`}
          onClick={() => onRowClick?.(r)}
        >
          <span className="crm-sched-time">{r.time}</span>
          <span className="crm-sched-name">{r.name}</span>
          <span className="crm-sched-format">{r.format}</span>
          <span className="crm-sched-amount">
            {r.amountMain ? <strong>{r.amountMain}</strong> : null}
            {r.amountNote ? <span>{r.amountNote}</span> : null}
          </span>
          {r.actions ? (
            <span className="crm-sched-past-actions" onClick={(e) => e.stopPropagation()}>
              {r.actions}
            </span>
          ) : (
            <>
              {r.status ? <span className={`admin-status tone-${r.status.tone}`}>{r.status.label}</span> : <span />}
              <span className="crm-sched-open" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

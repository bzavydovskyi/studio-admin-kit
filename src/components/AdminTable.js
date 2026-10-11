// Generic data table with a built-in mobile fallback: below a breakpoint,
// admin-kit.css turns each row into a stacked label/value card using the
// `data-label` attribute set on every cell here — no separate mobile
// markup to maintain.
//
// `columns`: [{ key, label, render?(row) }]. `rowKey(row)` defaults to
// `row.id`.
export default function AdminTable({ columns, rows, rowKey, emptyText = "Записів немає.", onRowClick }) {
  if (!rows?.length) return <div className="admin-empty">{emptyText}</div>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey ? rowKey(row) : row.id;
            return (
              <tr key={key} className={onRowClick ? "is-clickable" : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {columns.map((c) => (
                  <td key={c.key} data-label={c.label}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

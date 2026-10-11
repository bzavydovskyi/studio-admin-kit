// A titled block on a page (.crm-section-card) — the wrapper used for
// "Потребують уваги", "Далі сьогодні", "Минулі — потребують завершення",
// and any similar titled block.
export default function SectionCard({ title, titleRight, className, children, bodyRef }) {
  return (
    <div className={`crm-section-card${className ? ` ${className}` : ""}`} ref={bodyRef}>
      {title ? (
        <div className="crm-sched-head">
          <h3>{title}</h3>
          {titleRight}
        </div>
      ) : null}
      {children}
    </div>
  );
}

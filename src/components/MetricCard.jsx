export function MetricCard({ icon: Icon, label, value, note, tone = "blue" }) {
  const displayValue = Number(value || 0).toLocaleString("vi-VN");
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <span className="metric-icon">
          <Icon size={17} />
        </span>
        <span className="metric-label">{label}</span>
      </div>
      <strong className="metric-value">{displayValue}</strong>
      <small>{note}</small>
    </article>
  );
}

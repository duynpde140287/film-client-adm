export function StatusBadge({ value }) {
  const label = value || "UNKNOWN";
  const tone = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_");
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

export function CookieStatus({ cookie }) {
  const connected = cookie.status === "CONNECTED";
  return (
    <span
      className={`cookie-chip${connected ? " cookie-connected" : " cookie-expired"}`}
    >
      {cookie.provider} <span>{cookie.status}</span>
    </span>
  );
}

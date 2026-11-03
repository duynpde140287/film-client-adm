export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}

export function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("sv-SE");
}

export function toTimestamp(value, endOfDay = false) {
  const date = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  if (Number.isNaN(date.getTime()))
    throw new Error("Ngày license không hợp lệ.");
  return date.toISOString();
}

export const MAX_LICENSE_START_DATE = "2038-01-19";
export const MAX_LICENSE_EXPIRY_DATE = "2038-01-18";

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function formatMegabytes(bytes) {
  return bytes ? `${(Number(bytes) / 1024 / 1024).toFixed(1)} MB` : "—";
}

export function validDay(day: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}
export function nextRenewal(day: string, period: "monthly" | "annual") {
  const [y, m, d] = day.split("-").map(Number);
  const target = new Date(
    Date.UTC(y, m - 1 + (period === "annual" ? 12 : 1), 1),
  );
  const max = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(d, max));
  return target.toISOString().slice(0, 10);
}

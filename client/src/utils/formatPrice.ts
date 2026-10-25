/**
 * A price as the shop writes it: "Rs. 12,500". Grouping the thousands matters on
 * furniture, where a total like "Rs. 125000" is easy to misread by a digit.
 */
export function formatPrice(amount: number | null | undefined): string {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;

  return `Rs. ${safe.toLocaleString("en-US", {
    maximumFractionDigits: Number.isInteger(safe) ? 0 : 2,
  })}`;
}

/**
 * A wa.me link for a number in any format. wa.me wants digits only: a leading
 * "+" or spaces make WhatsApp open its "invalid link" page instead of the chat.
 * Returns '' when there is no usable number so callers can hide the link.
 */
export function buildWhatsAppLink(number?: string | null, message?: string): string {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return "";

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

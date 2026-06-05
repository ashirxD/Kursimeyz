export const PAKISTANI_MOBILE_HINT =
  "Use a Pakistani mobile number like +923001234567 or 03001234567.";

export const normalizePakistaniMobile = (value: string) => {
  const compact = value.trim().replace(/[\s().-]/g, "");

  if (!/^\+?\d+$/.test(compact)) {
    return "";
  }

  let digits = compact.startsWith("+") ? compact.slice(1) : compact;

  if (digits.startsWith("03") && digits.length === 11) {
    digits = `92${digits.slice(1)}`;
  }

  if (/^923\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  return "";
};

export const isValidPakistaniMobile = (value?: string | null) =>
  Boolean(value && normalizePakistaniMobile(value));

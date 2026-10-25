/**
 * The delivery details a shopper last used, kept in this browser so the cart's
 * delivery estimate and checkout start from what they already told us. Storage
 * can be blocked or full, so every read and write is allowed to fail quietly.
 */
export interface CheckoutPrefs {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
}

const STORAGE_KEY = "kursimeyz-checkout-prefs";

const EMPTY: CheckoutPrefs = { street: "", city: "", zipCode: "", phone: "" };

export function loadCheckoutPrefs(): CheckoutPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };

    const parsed = JSON.parse(raw) as Partial<CheckoutPrefs>;
    return {
      street: typeof parsed.street === "string" ? parsed.street : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      zipCode: typeof parsed.zipCode === "string" ? parsed.zipCode : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveCheckoutPrefs(update: Partial<CheckoutPrefs>) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...loadCheckoutPrefs(), ...update }),
    );
  } catch {
    // Nothing to do: the shopper just retypes next time.
  }
}

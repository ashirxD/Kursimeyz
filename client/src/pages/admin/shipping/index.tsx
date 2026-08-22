import { useState, type FormEvent } from "react";
import Header from "@/pages/admin/layout/Header";
import {
  useShippingCities,
  type ShippingCity,
} from "@/hooks/useShippingCities";

const getErrorMessage = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response;
  return response?.data?.message || fallback;
};

/**
 * Delivery rates per city. Checkout suggests these and charges the rate the
 * customer's city carries; anywhere not on this list is treated as a custom
 * city — no delivery charge, flagged on the order so the rate can be agreed
 * with the customer afterwards.
 */
export default function ShippingPage() {
  const {
    cities,
    isLoading,
    createCity,
    isCreating,
    updateCity,
    deleteCity,
  } = useShippingCities();

  const [newCity, setNewCity] = useState({ name: "", shippingPrice: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!newCity.name.trim()) {
      setMessage({ type: "error", text: "Enter a city name." });
      return;
    }

    try {
      await createCity({
        name: newCity.name,
        shippingPrice: Number(newCity.shippingPrice) || 0,
      });
      setNewCity({ name: "", shippingPrice: "" });
      setMessage({ type: "success", text: `${newCity.name.trim()} added.` });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Failed to add city. Please try again."),
      });
    }
  };

  const handleSaveRate = async (city: ShippingCity, shippingPrice: number) => {
    setMessage({ type: "", text: "" });

    try {
      await updateCity({ id: city._id, shippingPrice });
      setMessage({
        type: "success",
        text: `${city.name} now ships at Rs. ${shippingPrice}.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Failed to save rate. Please try again."),
      });
    }
  };

  const handleDelete = async (city: ShippingCity) => {
    setMessage({ type: "", text: "" });

    try {
      await deleteCity(city._id);
      setMessage({
        type: "success",
        text: `${city.name} removed. Orders from there are now custom-city orders.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Failed to remove city. Please try again."),
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      <div className="flex flex-col gap-6 px-4 md:px-2">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
            Shipping
          </h2>
          <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
            Set the delivery rate for each city customers can pick at checkout.
          </p>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            <span className="material-symbols-outlined">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] gap-6">
          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl! text-green-600">
                  local_shipping
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-forest-moss tracking-tight">
                  Delivery Rates
                </h3>
                <p className="text-forest-moss-light/60 font-bold text-xs">
                  {cities.length} {cities.length === 1 ? "city" : "cities"} on
                  the list
                </p>
              </div>
            </div>

            <form
              onSubmit={handleAdd}
              className="flex flex-col sm:flex-row gap-3 mb-6 pb-6 border-b border-forest-moss/5"
            >
              <input
                type="text"
                value={newCity.name}
                onChange={(e) =>
                  setNewCity({ ...newCity, name: e.target.value })
                }
                placeholder="Add a city, e.g. Chiniot"
                className="flex-1 bg-oatmeal/30 px-4 py-3.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30"
              />
              <input
                type="number"
                min="0"
                value={newCity.shippingPrice}
                onChange={(e) =>
                  setNewCity({ ...newCity, shippingPrice: e.target.value })
                }
                placeholder="Rate"
                className="sm:w-32 bg-oatmeal/30 px-4 py-3.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30"
              />
              <button
                type="submit"
                disabled={isCreating}
                className="bg-forest-moss text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest-moss-light transition-all shadow-medium disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg!">add</span>
                Add
              </button>
            </form>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-moss" />
              </div>
            ) : cities.length === 0 ? (
              <p className="text-forest-moss-light/60 font-bold text-sm py-8 text-center">
                No cities yet. Every customer will be treated as a custom city
                until you add one.
              </p>
            ) : (
              <div className="space-y-2">
                {cities.map((city) => (
                  <CityRow
                    key={city._id}
                    city={city}
                    onSave={(price) => handleSaveRate(city, price)}
                    onDelete={() => handleDelete(city)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-14 rounded-2xl bg-forest-moss/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl! text-forest-moss">
                  info
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-forest-moss tracking-tight">
                  How Rates Apply
                </h3>
                <p className="text-forest-moss-light/60 font-bold text-xs">
                  What customers see at checkout
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                "Customers type their city and pick from this list as they type.",
                "Picking a listed city charges that rate on the order total.",
                "Any other city is accepted with no delivery charge, and the customer is told rates may vary and to reach you on WhatsApp.",
                "Those orders are marked 'Custom city' on the Orders page so you can agree a rate.",
              ].map((item, index) => (
                <div key={item} className="flex gap-4">
                  <div className="size-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                    <span className="text-clay font-black text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-forest-moss-light/70 text-xs font-bold leading-relaxed pt-1">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-oatmeal/50 rounded-xl border border-forest-moss/5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-forest-moss/50">
                  lightbulb
                </span>
                <p className="text-forest-moss-light/60 text-xs font-bold leading-relaxed">
                  Set a rate to 0 for free delivery to that city. Removing a
                  city does not change orders already placed — they keep the
                  price they were charged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CityRowProps {
  city: ShippingCity;
  onSave: (shippingPrice: number) => Promise<void>;
  onDelete: () => Promise<void>;
}

/** One city. The Save button only appears once the rate actually differs. */
const CityRow = ({ city, onSave, onDelete }: CityRowProps) => {
  const [price, setPrice] = useState(String(city.shippingPrice));
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const parsedPrice = Number(price);
  const isValid = price.trim() !== "" && Number.isFinite(parsedPrice) && parsedPrice >= 0;
  const isDirty = isValid && parsedPrice !== city.shippingPrice;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(parsedPrice);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-oatmeal/30 border border-forest-moss/5">
      <span className="material-symbols-outlined text-forest-moss/30 text-xl!">
        location_on
      </span>
      <span className="flex-1 min-w-0 font-black text-sm text-forest-moss truncate">
        {city.name}
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-black text-forest-moss/40">Rs.</span>
        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 bg-white px-3 py-2 rounded-lg border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all font-bold text-sm"
        />
      </div>

      {isDirty && (
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="shrink-0 bg-forest-moss text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-forest-moss-light transition-all disabled:opacity-50"
        >
          {isSaving ? "Saving" : "Save"}
        </button>
      )}

      {confirmingDelete ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-500 text-white px-3 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="text-forest-moss/40 px-2 py-2 font-black text-[10px] uppercase tracking-widest hover:text-forest-moss transition-all"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label={`Remove ${city.name}`}
          onClick={() => setConfirmingDelete(true)}
          className="shrink-0 size-9 flex items-center justify-center rounded-lg text-forest-moss/30 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <span className="material-symbols-outlined text-lg!">delete</span>
        </button>
      )}
    </div>
  );
};

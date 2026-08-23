import { useEffect, useRef, useState } from "react";
import type { ShippingCity } from "@/hooks/useShippingCities";

interface CitySelectProps {
  label: string;
  placeholder: string;
  value: string;
  cities: ShippingCity[];
  onChange: (value: string) => void;
}

/**
 * City field for checkout. Typing filters the cities the shop has a delivery
 * rate for, but anything else is accepted too — a customer outside the list
 * still gets to order, and checkout tells them the rate follows separately.
 */
export default function CitySelect({
  label,
  placeholder,
  value,
  cities,
  onChange,
}: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clicking elsewhere on the page should dismiss the list, not just blurring
  // the input — the suggestions are mousedown targets themselves.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const query = value.trim().toLowerCase();
  // Reopening the list after picking a city shows every city rather than the
  // single row matching what is already in the field, so switching is possible.
  const isExactMatch = cities.some(
    (city) => city.name.toLowerCase() === query,
  );
  const suggestions =
    query && !isExactMatch
      ? cities.filter((city) => city.name.toLowerCase().includes(query))
      : cities;

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          required
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="w-full h-14 pl-6 pr-12 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#ff311b] transition-all outline-none font-bold text-[#1a2f1a]"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Show cities"
          onClick={() => setIsOpen((open) => !open)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a2f1a]/30 hover:text-[#1a2f1a] transition-colors"
        >
          <span
            className="material-symbols-outlined text-[22px] transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            expand_more
          </span>
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-black/10 border border-slate-100 p-2 max-h-64 overflow-y-auto">
          {suggestions.map((city) => (
            <li key={city._id}>
              <button
                type="button"
                onClick={() => {
                  onChange(city.name);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-[#f4f5f0] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-[#ff311b]">
                  location_on
                </span>
                <span className="text-[13px] font-bold text-[#1a2f1a] truncate">
                  {city.name}
                </span>
                <span className="ml-auto text-[11px] font-bold text-[#1a2f1a]/40 shrink-0">
                  Rs. {city.shippingPrice}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

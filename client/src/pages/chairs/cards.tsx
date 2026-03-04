import type { Chair } from "@/pages/admin/chairs/cards";

interface ChairProductCardProps {
  chair: Chair;
  badge?: "NEW" | "SALE";
}

export default function ChairProductCard({
  chair,
  badge,
}: ChairProductCardProps) {
  const getImageUrl = (url: string) => {
    if (!url)
      return "https://images.unsplash.com/photo-1581412003502-97cc921d5421?w=500";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative bg-[#f4f5f0] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-6 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-black/5">
        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              badge === "NEW"
                ? "bg-[#5ef037] text-white"
                : "bg-[#5ef037] text-white"
            }`}
          >
            {badge}
          </div>
        )}

        {/* Product Image */}
        <img
          src={getImageUrl(chair.image)}
          alt={chair.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Product Info */}
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-[#1a2f1a] truncate">
            {chair.name}
          </h3>
          <p className="text-[12px] text-[#1a2f1a]/40 font-medium mt-0.5 truncate">
            {chair.description}
          </p>
        </div>
        <span className="text-[15px] font-bold text-[#1a2f1a] whitespace-nowrap">
          ${chair.price}
        </span>
      </div>
    </div>
  );
}

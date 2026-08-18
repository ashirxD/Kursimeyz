import { useRef } from "react";
import { Link } from "react-router-dom";
import { useProductTypes } from "@/hooks/useProductTypes";
import { resolveImageUrl } from "@/utils/imageUrl";
import TopPicks from "../topPicks";

export default function Dashboard() {
  const findYourSpaceRef = useRef<HTMLDivElement>(null);
  const { productTypes } = useProductTypes();

  const scrollToCollection = () => {
    findYourSpaceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pt-16 pb-12">
      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between min-h-[400px] lg:min-h-[500px] gap-8 py-6 lg:py-12">
        {/* Text Content */}
        <div className="flex-1 max-w-[500px] z-10">
          <div className="inline-flex items-center gap-1.5 mb-5 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="size-1 bg-[#ff6b35] rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a2f1a]/40">
              New Collection 2026
            </span>
          </div>

          <h1 className="text-[44px] lg:text-[56px] font-black leading-[0.95] text-[#1a2f1a] tracking-tight mb-6 animate-in fade-in slide-in-from-left-6 duration-1000">
            Sit Back.
            <br />
            <span className="text-[#d27d53]">Breathe.</span>
            <br />
            <span className="text-[#ff6b35]">Belong.</span>
          </h1>

          <p className="text-base text-[#1a2f1a]/50 font-medium leading-relaxed max-w-[380px] mb-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
            Handcrafted chairs designed for your peace of mind. Experience
            comfort that connects you back to nature.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <button
              onClick={scrollToCollection}
              className="h-14 px-8 bg-[#ff6b35] hover:bg-[#f05a28] text-white font-black text-base rounded-full flex items-center gap-2.5 transition-all transform hover:scale-[1.05] active:scale-95 shadow-xl shadow-[#ff6b35]/20 cursor-pointer"
            >
              Shop Collection
              <span className="material-symbols-outlined font-black text-xl">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="flex-1 relative w-full max-w-[600px] aspect-[3/2] group">
          <div className="absolute inset-0 bg-slate-50/50 rounded-[20px] lg:rounded-[32px] transform rotate-1 group-hover:rotate-0 transition-transform duration-1000"></div>
          <div className="relative w-full h-full rounded-[20px] lg:rounded-[32px] overflow-hidden shadow-2xl transition-transform duration-1000 hover:scale-[1.02]">
            <img
              src="https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=1500"
              alt="Minimalist Interior Decor"
              className="w-full h-full object-cover"
            />

            {/* Decorative leaf icons from image */}
            <div className="absolute top-10 left-10 p-4 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <span className="material-symbols-outlined text-white text-3xl">
                eco
              </span>
            </div>

            <div className="absolute bottom-12 right-12 p-4 bg-[#d27d53]/20 backdrop-blur-md rounded-full shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
              <span className="material-symbols-outlined text-[#d27d53] text-2xl">
                nest_eco_leaf
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Picks Selection */}
      <TopPicks limit={5} isDashboard={true} />

      {/* Find Your Space Section */}
      <section ref={findYourSpaceRef} id="find-your-space" className="py-16 border-t border-slate-50">
        <div className="mb-12 px-4 max-w-md">
          <h2 className="text-[36px] font-black text-[#1a2f1a] tracking-tight leading-tight mb-3">
            Find Your Space
          </h2>
          <p className="text-lg text-slate-400 font-medium">
            Curated collections for every corner of your life.
          </p>
        </div>

        {/* Built from the admin's product kinds, so adding one lists it here. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {productTypes.map((type) => (
            <Link
              to={`/shop/${type.pluralSlug}`}
              key={type._id}
              id={type.pluralSlug}
              className="group cursor-pointer flex flex-col items-center text-center"
            >
              <div className="relative aspect-[4/5] w-full rounded-[32px] overflow-hidden mb-6 transition-all duration-700 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-black/10">
                {type.coverImage ? (
                  <img
                    src={resolveImageUrl(type.coverImage)}
                    alt={type.pluralName}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#f4f5f0] transition-transform duration-1000 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[72px] text-[#1a2f1a]/15">
                      {type.icon}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
              <h3 className="text-xl font-black text-[#1a2f1a] group-hover:text-[#ff6b35] transition-colors duration-300 uppercase tracking-widest text-[16px]">
                {type.pluralName}
              </h3>
              {type.tagline && (
                <p className="text-[#1a2f1a]/40 font-bold text-[10px] tracking-widest mt-2 uppercase">
                  {type.tagline}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

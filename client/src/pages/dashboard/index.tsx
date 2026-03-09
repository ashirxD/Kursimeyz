import { Link } from "react-router-dom";
import TopPicks from "../topPicks";

export default function Dashboard() {
  return (
    <div className="pt-16 pb-12">
      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between min-h-[400px] lg:min-h-[500px] gap-8 py-6 lg:py-12">
        {/* Text Content */}
        <div className="flex-1 max-w-[500px] z-10">
          <div className="inline-flex items-center gap-1.5 mb-5 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="size-1 bg-[#5ef037] rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a2f1a]/40">
              New Collection 2024
            </span>
          </div>

          <h1 className="text-[44px] lg:text-[56px] font-black leading-[0.95] text-[#1a2f1a] tracking-tight mb-6 animate-in fade-in slide-in-from-left-6 duration-1000">
            Sit Back.
            <br />
            <span className="text-[#d27d53]">Breathe.</span>
            <br />
            <span className="text-[#5ef037]">Belong.</span>
          </h1>

          <p className="text-base text-[#1a2f1a]/50 font-medium leading-relaxed max-w-[380px] mb-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
            Handcrafted chairs designed for your peace of mind. Experience
            comfort that connects you back to nature.
          </p>

          <div className="flex flex-wrap items-center gap-5 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <button className="h-14 px-8 bg-[#5ef037] hover:bg-[#4ad12d] text-white font-black text-base rounded-full flex items-center gap-2.5 transition-all transform hover:scale-[1.05] active:scale-95 shadow-xl shadow-[#5ef037]/20 cursor-pointer">
              Shop Collection
              <span className="material-symbols-outlined font-black text-xl">
                arrow_forward
              </span>
            </button>

            <button className="h-14 px-8 border-2 border-slate-100 hover:border-[#1a2f1a] hover:bg-[#1a2f1a] hover:text-white text-[#1a2f1a] font-black text-base rounded-full flex items-center gap-2.5 transition-all transform cursor-pointer group">
              <span className="material-symbols-outlined font-black group-hover:scale-110 transition-transform text-xl">
                play_circle
              </span>
              Watch Film
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
      <section className="py-16 border-t border-slate-50">
        <div className="flex items-end justify-between mb-12 px-4">
          <div className="max-w-md">
            <h2 className="text-[36px] font-black text-[#1a2f1a] tracking-tight leading-tight mb-3">
              Find Your Space
            </h2>
            <p className="text-lg text-slate-400 font-medium">
              Curated collections for every corner of your life.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="size-11 rounded-full border border-slate-100 flex items-center justify-center text-[#1a2f1a] hover:bg-slate-50 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">
                arrow_back
              </span>
            </button>
            <button className="size-11 rounded-full bg-[#111c11] flex items-center justify-center text-white hover:bg-black shadow-lg shadow-black/10 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              name: "Chairs",
              desc: "Handcrafted Comfort",
              img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800",
              url: "/shop/chairs",
            },
            {
              name: "Tables",
              desc: "Modern Elegance",
              img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800",
              url: "/shop/tables",
            },
            {
              name: "Sofas",
              desc: "Luxurious Lounging",
              img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800",
              url: "/shop/sofas",
            },
          ].map((category, idx) => (
            <Link
              to={category.url}
              key={idx}
              className="group cursor-pointer flex flex-col items-center text-center"
            >
              <div className="relative aspect-[4/5] w-full rounded-[32px] overflow-hidden mb-6 transition-all duration-700 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-black/10">
                <img
                  src={category.img}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
              <h3 className="text-xl font-black text-[#1a2f1a] group-hover:text-[#5ef037] transition-colors duration-300 uppercase tracking-widest text-[16px]">
                {category.name}
              </h3>
              <p className="text-[#1a2f1a]/40 font-bold text-[10px] tracking-widest mt-2 uppercase">
                {category.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

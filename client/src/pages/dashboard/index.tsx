export default function Dashboard() {
    return (
        <div className="pt-16 pb-12">
            {/* Hero Section */}
            <section className="relative flex flex-col lg:flex-row items-center justify-between min-h-[400px] lg:min-h-[500px] gap-8 py-6 lg:py-12">
                {/* Text Content */}
                <div className="flex-1 max-w-[500px] z-10">
                    <div className="inline-flex items-center gap-1.5 mb-5 animate-in fade-in slide-in-from-left-4 duration-700">
                        <span className="size-1 bg-[#5ef037] rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a2f1a]/40">New Collection 2024</span>
                    </div>

                    <h1 className="text-[44px] lg:text-[56px] font-black leading-[0.95] text-[#1a2f1a] tracking-tight mb-6 animate-in fade-in slide-in-from-left-6 duration-1000">
                        Sit Back.
                        <br />
                        <span className="text-[#d27d53]">Breathe.</span>
                        <br />
                        <span className="text-[#5ef037]">Belong.</span>
                    </h1>

                    <p className="text-base text-[#1a2f1a]/50 font-medium leading-relaxed max-w-[380px] mb-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
                        Handcrafted chairs designed for your peace of mind.
                        Experience comfort that connects you back to nature.
                    </p>

                    <div className="flex flex-wrap items-center gap-5 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                        <button className="h-14 px-8 bg-[#5ef037] hover:bg-[#4ad12d] text-white font-black text-base rounded-full flex items-center gap-2.5 transition-all transform hover:scale-[1.05] active:scale-95 shadow-xl shadow-[#5ef037]/20 cursor-pointer">
                            Shop Collection
                            <span className="material-symbols-outlined font-black text-xl">arrow_forward</span>
                        </button>

                        <button className="h-14 px-8 border-2 border-slate-100 hover:border-[#1a2f1a] hover:bg-[#1a2f1a] hover:text-white text-[#1a2f1a] font-black text-base rounded-full flex items-center gap-2.5 transition-all transform cursor-pointer group">
                            <span className="material-symbols-outlined font-black group-hover:scale-110 transition-transform text-xl">play_circle</span>
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
                            <span className="material-symbols-outlined text-white text-3xl">eco</span>
                        </div>

                        <div className="absolute bottom-12 right-12 p-4 bg-[#d27d53]/20 backdrop-blur-md rounded-full shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                            <span className="material-symbols-outlined text-[#d27d53] text-2xl">nest_eco_leaf</span>
                        </div>
                    </div>
                </div>
            </section>

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
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </button>
                        <button className="size-11 rounded-full bg-[#111c11] flex items-center justify-center text-white hover:bg-black shadow-lg shadow-black/10 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            name: 'The Lounge',
                            desc: 'For your daily reset',
                            img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
                            tag: 'Most Popular'
                        },
                        {
                            name: 'The Office',
                            desc: 'Productive calm',
                            img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800'
                        },
                        {
                            name: 'The Dining Room',
                            desc: 'Shared moments',
                            img: 'https://images.unsplash.com/photo-1595514533215-665c912b7042?auto=format&fit=crop&q=80&w=800'
                        },
                        {
                            name: 'Outdoor Living',
                            desc: "Nature's embrace",
                            img: 'https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&q=80&w=800'
                        }
                    ].map((category, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                <img
                                    src={category.img}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {category.tag && (
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#1a2f1a]">{category.tag}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                            </div>
                            <h3 className="text-lg font-black text-[#1a2f1a] group-hover:text-[#5ef037] transition-colors duration-300">
                                {category.name}
                            </h3>
                            <p className="text-[#1a2f1a]/40 font-bold text-[11px] tracking-wide mt-1 uppercase">
                                {category.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

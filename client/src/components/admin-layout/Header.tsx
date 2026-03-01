import { useSidebar } from "@/contexts/SidebarContext";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex justify-between items-center py-4 px-2">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Mobile Only */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden size-11 rounded-full bg-white shadow-soft flex items-center justify-center text-forest-moss hover:bg-sage-soft transition-all border border-white/50"
        >
          <span className="material-symbols-outlined !text-2xl">menu</span>
        </button>

        <div className="space-y-0.5">
          {/* Brand for mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-forest-moss !text-xl">
              chair
            </span>
            <h1 className="text-sm font-black text-forest-moss uppercase tracking-tighter">
              Kursimeyz
            </h1>
          </div>

          <h2 className="text-xl md:text-3xl font-black text-forest-moss tracking-tight flex items-center gap-2">
            Hello, Maker! <span className="text-xl md:text-2xl">👋</span>
          </h2>
          <p className="hidden md:block text-forest-moss-light/70 font-bold text-sm">
            Here's what's happening in your workshop today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="size-10 md:size-11 rounded-full bg-white shadow-soft flex items-center justify-center text-forest-moss hover:bg-sage-soft transition-all hover:scale-105 active:scale-95 border border-white/50">
          <span className="material-symbols-outlined !text-xl">
            notifications
          </span>
        </button>
        <button className="size-10 md:size-11 rounded-full bg-white shadow-soft flex items-center justify-center text-forest-moss hover:bg-sage-soft transition-all hover:scale-105 active:scale-95 border border-white/50">
          <span className="material-symbols-outlined !text-xl">search</span>
        </button>
      </div>
    </header>
  );
}

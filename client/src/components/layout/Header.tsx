export default function Header() {
    return (
        <header className="flex justify-between items-center py-4 px-2">
            <div className="space-y-0.5">
                <h2 className="text-3xl font-black text-forest-moss tracking-tight flex items-center gap-2">
                    Hello, Maker! <span className="text-2xl">👋</span>
                </h2>
                <p className="text-forest-moss-light/70 font-bold text-sm">
                    Here's what's happening in your workshop today.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button className="size-11 rounded-full bg-white shadow-soft flex items-center justify-center text-forest-moss hover:bg-sage-soft transition-all hover:scale-105 active:scale-95 border border-white/50">
                    <span className="material-symbols-outlined !text-xl">notifications</span>
                </button>
                <button className="size-11 rounded-full bg-white shadow-soft flex items-center justify-center text-forest-moss hover:bg-sage-soft transition-all hover:scale-105 active:scale-95 border border-white/50">
                    <span className="material-symbols-outlined !text-xl">search</span>
                </button>
            </div>
        </header>
    );
}

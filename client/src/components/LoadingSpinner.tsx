const LoadingSpinner = () => (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center bg-oatmeal p-8 rounded-[3rem]">
        <div className="relative">
            {/* Outer Decorative Ring */}
            <div className="size-24 border-[3px] border-forest-moss/5 rounded-full absolute -inset-1 animate-pulse"></div>

            {/* Spinning Indicator */}
            <div className="size-22 border-[3px] border-transparent border-t-clay rounded-full animate-spin"></div>

            {/* Center Character (The Chair) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined !text-4xl text-forest-moss !leading-none animate-bounce" style={{ animationDuration: '2s' }}>
                        chair
                    </span>
                    {/* Subtle Shadow beneath chair */}
                    <div className="w-6 h-1 bg-forest-moss/10 rounded-full blur-[2px] -mt-1 scale-x-110 animate-pulse"></div>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-forest-moss/10"></span>
                <p className="text-forest-moss font-black text-xs uppercase tracking-[0.15em]">Kursimeyz</p>
                <span className="h-px w-8 bg-forest-moss/10"></span>
            </div>
            <p className="text-forest-moss-light/50 font-bold text-[9px] uppercase tracking-widest animate-pulse">
                Assembling Your Experience
            </p>
        </div>
    </div>
);

export default LoadingSpinner;

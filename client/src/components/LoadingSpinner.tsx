import BrandLogo from "@/components/BrandLogo";

const LoadingSpinner = () => (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center bg-oatmeal p-8 rounded-[3rem]">
        <div className="relative">
            {/* Outer Decorative Ring */}
            <div className="size-24 border-[3px] border-forest-moss/5 rounded-full absolute -inset-1 animate-pulse"></div>

            {/* Spinning Indicator */}
            <div className="size-22 border-[3px] border-transparent border-t-clay rounded-full animate-spin"></div>

            {/* Center Brand Mark */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <BrandLogo imageClassName="h-8 w-auto max-w-[76px] animate-bounce" />
                    <div className="w-10 h-1 bg-forest-moss/10 rounded-full blur-[2px] mt-1 scale-x-110 animate-pulse"></div>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-forest-moss/10"></span>
                <BrandLogo imageClassName="h-7 w-auto max-w-[120px]" />
                <span className="h-px w-8 bg-forest-moss/10"></span>
            </div>
            <p className="text-forest-moss-light/50 font-bold text-[9px] uppercase tracking-widest animate-pulse">
                Assembling Your Experience
            </p>
        </div>
    </div>
);

export default LoadingSpinner;

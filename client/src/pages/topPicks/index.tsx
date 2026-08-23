import { Link } from "react-router-dom";
import ProductCarousel from "@/components/ProductCarousel";
import { useTopPicks } from "@/hooks/useTopPicks";
import TopPickCard from "./card";

interface TopPicksProps {
  /**
   * Renders the home shelf: a carousel, sized to sit inside the dashboard.
   * Otherwise this is the standalone /top-picks page, which grids everything.
   */
  isDashboard?: boolean;
}

/**
 * The Top Picks shelf — whatever an admin marked with the star on their product
 * cards, newest pick first.
 *
 * On the home page the picks go into a carousel, so marking a tenth product
 * widens what a shopper can browse instead of pushing the rest of the page down.
 */
export default function TopPicks({ isDashboard = false }: TopPicksProps) {
  const { topPicks, isTopPicksLoading } = useTopPicks();

  if (isTopPicksLoading) {
    return (
      <div
        className={`${isDashboard ? "py-10" : "pt-32 pb-16"} flex items-center justify-center`}
      >
        <div className="animate-pulse text-[#1a2f1a]/40 font-bold uppercase tracking-widest text-[10px]">
          Curating your top picks...
        </div>
      </div>
    );
  }

  // Nothing marked yet. The home page simply skips the section rather than
  // showing an empty shelf; the standalone page has to say something.
  if (topPicks.length === 0 && isDashboard) {
    return null;
  }

  return (
    <div
      className={`${isDashboard ? "py-12" : "pt-24 pb-16"} px-4 md:px-8 max-w-[1600px] mx-auto`}
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#1a2f1a]/5" />
        <h1 className="text-[10px] font-black text-[#1a2f1a]/30 uppercase tracking-[0.4em] whitespace-nowrap">
          Top Picks
        </h1>
        {isDashboard && (
          <Link
            to="/top-picks"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a2f1a]/30 hover:text-[#ff311b] transition-colors whitespace-nowrap"
          >
            See all
          </Link>
        )}
        <div className="h-px flex-1 bg-[#1a2f1a]/5" />
      </div>

      {topPicks.length === 0 ? (
        <p className="py-16 text-center text-[#1a2f1a]/40 font-bold">
          No top picks have been curated yet.
        </p>
      ) : isDashboard ? (
        <ProductCarousel label="Top Picks">
          {topPicks.map((product) => (
            <TopPickCard key={product._id} product={product} isDashboard />
          ))}
        </ProductCarousel>
      ) : (
        <div className="grid gap-x-8 gap-y-12 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {topPicks.map((product) => (
            <TopPickCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

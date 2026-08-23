import { useRef } from "react";
import { Link } from "react-router-dom";
import CollectionCover from "@/components/CollectionCover";
import HomeHero from "@/components/HomeHero";
import { useHomePage } from "@/hooks/useHomePage";
import { useProductTypes } from "@/hooks/useProductTypes";
import TopPicks from "../topPicks";

export default function Dashboard() {
  const findYourSpaceRef = useRef<HTMLDivElement>(null);
  const { productTypes } = useProductTypes();
  const { content, isLoading: heroLoading } = useHomePage();

  const scrollToCollection = () => {
    findYourSpaceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pt-16 pb-12">
      {/* Hero — every word, colour and photo of it is authored under /admin/home. */}
      {heroLoading ? (
        // Holds the space rather than collapsing, so the sections below do not
        // jump once the hero arrives.
        <div className="min-h-[400px] lg:min-h-[500px]" />
      ) : (
        content?.hero.enabled && (
          <HomeHero hero={content.hero} onScrollRequest={scrollToCollection} />
        )
      )}

      {/* Top Picks — the shelf the admin curated with the star on their product
          cards. Carousels itself when there are more picks than fit. */}
      <TopPicks isDashboard={true} />

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
                <CollectionCover
                  images={type.coverImages}
                  icon={type.icon}
                  alt={type.pluralName}
                  layerClassName="duration-1000 group-hover:scale-110"
                  iconClassName="text-[72px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
              <h3 className="text-xl font-black text-[#1a2f1a] group-hover:text-[#ff311b] transition-colors duration-300 uppercase tracking-widest text-[16px]">
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

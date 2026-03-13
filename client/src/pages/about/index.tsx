import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="pt-24 pb-16 max-w-[1200px] mx-auto px-6 md:px-10">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <div className="inline-flex items-center gap-1.5 mb-5">
          <span className="size-1 bg-[#5ef037] rounded-full"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a2f1a]/40">
            Our Story
          </span>
        </div>
        <h1 className="text-[40px] lg:text-[52px] font-black leading-[1] text-[#1a2f1a] tracking-tight mb-6">
          Crafting Comfort
          <br />
          <span className="text-[#5ef037]">Since 2020</span>
        </h1>
        <p className="text-lg text-[#1a2f1a]/50 font-medium leading-relaxed max-w-[600px] mx-auto">
          We believe that everyone deserves a space to relax, unwind, and feel truly at home. 
          Our mission is to bring you furniture that transforms houses into sanctuaries.
        </p>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "eco",
              title: "Sustainable",
              desc: "We use eco-friendly materials and sustainable practices to minimize our environmental footprint.",
            },
            {
              icon: "handshake",
              title: "Handcrafted",
              desc: "Each piece is meticulously crafted by skilled artisans who pour their passion into every detail.",
            },
            {
              icon: "favorite",
              title: "Made with Love",
              desc: "We put our heart into every product, ensuring you receive furniture that brings joy for years.",
            },
          ].map((value, idx) => (
            <div
              key={idx}
              className="text-center p-8 rounded-3xl bg-[#f4f5f0] hover:bg-[#eef0ea] transition-colors"
            >
              <div className="w-16 h-16 bg-[#5ef037] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#5ef037]/20">
                <span className="material-symbols-outlined text-white text-3xl">
                  {value.icon}
                </span>
              </div>
              <h3 className="text-xl font-black text-[#1a2f1a] mb-3">
                {value.title}
              </h3>
              <p className="text-[14px] text-[#1a2f1a]/50 font-medium leading-relaxed">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="mb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 mb-5">
              <span className="size-1 bg-[#5ef037] rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a2f1a]/40">
                Our Journey
              </span>
            </div>
            <h2 className="text-[32px] font-black text-[#1a2f1a] tracking-tight leading-tight mb-5">
              From a Small Workshop to Your Home
            </h2>
            <p className="text-[15px] text-[#1a2f1a]/60 font-medium leading-relaxed mb-4">
              Relaxing Chair Shop started as a small family workshop with a simple dream: 
              to create furniture that people truly love. What began as a passion project 
              has grown into a beloved brand trusted by thousands of customers.
            </p>
            <p className="text-[15px] text-[#1a2f1a]/60 font-medium leading-relaxed">
              Today, we continue to honor our roots by maintaining the same attention to 
              detail and commitment to quality that defined our first chair. Every piece 
              tells a story of dedication, craftsmanship, and the pursuit of comfort.
            </p>
          </div>
          <div className="flex-1 relative">
            <div className="aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000"
                alt="Craftsman working on furniture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl">
              <div className="text-[32px] font-black text-[#5ef037]">4+</div>
              <div className="text-[12px] font-bold text-[#1a2f1a]/60 uppercase tracking-wider">
                Years of Excellence
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-20 py-12 border-y border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "50+", label: "Products" },
            { number: "25+", label: "Artisans" },
            { number: "15+", label: "Cities Served" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-[36px] font-black text-[#1a2f1a] mb-1">
                {stat.number}
              </div>
              <div className="text-[12px] font-bold text-[#1a2f1a]/40 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-12">
        <div className="bg-[#1a2f1a] rounded-[32px] p-10 md:p-16 text-center">
          <h2 className="text-[28px] md:text-[36px] font-black text-white tracking-tight mb-4">
            Get in Touch
          </h2>
          <p className="text-white/60 font-medium mb-10 max-w-[500px] mx-auto">
            Have questions? We would love to hear from you. Reach out to our support team.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a
              href="mailto:support@relaxingchairshop.com"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">email</span>
              <span className="text-[14px] font-bold">support@relaxingchairshop.com</span>
            </a>
            <a
              href="tel:+923001234567"
              className="flex items-center gap-3 bg-[#5ef037] hover:bg-[#4ad12d] text-[#1a2f1a] px-6 py-4 rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">phone</span>
              <span className="text-[14px] font-bold">+92 300 123 4567</span>
            </a>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

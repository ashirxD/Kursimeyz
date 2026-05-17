import { useState } from "react";
import Header from "@/pages/admin/layout/Header";
import SofaCard from "./cards.tsx";
import AddSofaModal from "./add.tsx";
import { useProducts } from "@/hooks/useProducts";

export default function SofasPage() {
  const {
    products: sofas,
    isLoading,
    deleteProduct: deleteSofa,
  } = useProducts({ category: "sofa" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteSofa = async (id: string) => {
    try {
      await deleteSofa(id);
    } catch (error) {
      console.error("Failed to delete sofa:", error);
    }
  };

  if (isLoading && sofas.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-forest-moss font-bold animate-pulse">
            Loading Sofas...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      <div className="flex flex-col gap-6">
        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-2">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
              Sofas Collection
            </h2>
            <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
              Premium comfort for your living space.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-clay text-white px-6 py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 hover:bg-clay-soft hover:text-clay transition-all shadow-soft border border-clay"
          >
            <span className="material-symbols-outlined !text-xl">add</span>
            ADD NEW SOFA
          </button>
        </div>

        {/* Sofas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-2">
          {sofas.map((sofa) => (
            <SofaCard
              key={sofa.id}
              sofa={sofa}
              onDelete={handleDeleteSofa}
            />
          ))}
        </div>

        {sofas.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-forest-moss/10">
            <span className="material-symbols-outlined !text-6xl text-forest-moss/20 mb-4">
              weekend
            </span>
            <p className="text-forest-moss/40 font-bold">
              No sofas in your collection yet.
            </p>
          </div>
        )}
      </div>

      {/* Add Sofa Modal */}
      <AddSofaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

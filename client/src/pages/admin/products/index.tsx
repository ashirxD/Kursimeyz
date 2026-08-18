import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/pages/admin/layout/Header";
import CategoryTabs from "@/components/CategoryTabs";
import ProductFormModal from "@/components/ProductFormModal";
import ProductTypeFormModal from "@/components/ProductTypeFormModal";
import AdminProductCard from "./card";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useProductTypeBySlug } from "@/hooks/useProductTypes";
import { buildProductFormCopy } from "@/utils/productTypeCopy";

/**
 * One admin page for every kind of product. The URL segment picks the type, and
 * everything else — title, colour presets, card layout, form copy — comes from
 * that type's record, so a kind the admin added today behaves exactly like the
 * ones the shop shipped with.
 */
export default function AdminProductsPage() {
  const { typeSlug } = useParams<{ typeSlug: string }>();
  const { productType, isLoading: isLoadingType } = useProductTypeBySlug(typeSlug);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditTypeOpen, setIsEditTypeOpen] = useState(false);

  const { categories } = useCategories(productType?.slug);
  const {
    products,
    isLoading,
    addProduct,
    isAdding,
    deleteProduct,
  } = useProducts({
    category: productType?.slug,
    subCategory: activeCategory ?? undefined,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  if (isLoadingType) {
    return (
      <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-forest-moss font-bold animate-pulse">
            Loading Collection...
          </div>
        </div>
      </div>
    );
  }

  if (!productType) {
    return (
      <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
        <Header />
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-forest-moss/10 mx-4">
          <span className="material-symbols-outlined !text-6xl text-forest-moss/20 mb-4">
            search_off
          </span>
          <p className="text-forest-moss/40 font-bold mb-4">
            No product kind called "{typeSlug}".
          </p>
          <Link
            to="/admin/dashboard"
            className="bg-forest-moss text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-forest-moss-light transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const gridClass =
    productType.cardLayout === "wide"
      ? "grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-2"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-2";

  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      <div className="flex flex-col gap-6">
        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
                {productType.pluralName} Collection
              </h2>
              <button
                type="button"
                onClick={() => setIsEditTypeOpen(true)}
                title={`Edit ${productType.pluralName}`}
                className="size-8 rounded-full flex items-center justify-center text-forest-moss/30 hover:text-forest-moss hover:bg-white transition-all"
              >
                <span className="material-symbols-outlined !text-lg">edit</span>
              </button>
            </div>
            <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
              {productType.heroSubtitle ||
                `Manage your ${productType.pluralName.toLowerCase()} collection.`}
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto bg-clay text-white px-6 py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 hover:bg-clay-soft hover:text-clay transition-all shadow-soft border border-clay uppercase"
          >
            <span className="material-symbols-outlined !text-xl">add</span>
            Add New {productType.name}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 md:px-2">
          <CategoryTabs
            categories={categories}
            value={activeCategory}
            onChange={setActiveCategory}
            variant="admin"
          />
        </div>

        {/* Product Grid */}
        <div className={gridClass}>
          {products.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              productType={productType}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {products.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-forest-moss/10 mx-4 md:mx-2">
            <span className="material-symbols-outlined !text-6xl text-forest-moss/20 mb-4">
              {productType.icon}
            </span>
            <p className="text-forest-moss/40 font-bold">
              {activeCategory
                ? `No ${productType.pluralName.toLowerCase()} in this category.`
                : `No ${productType.pluralName.toLowerCase()} in your collection yet.`}
            </p>
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        copy={buildProductFormCopy(productType, "add")}
        defaultColor={productType.colorPresets[0] ?? "#3a4d39"}
        productType={productType.slug}
        isSubmitting={isAdding}
        onSubmit={(values) =>
          addProduct({
            ...values,
            image: values.images[0],
            category: productType.slug,
          })
        }
      />

      <ProductTypeFormModal
        isOpen={isEditTypeOpen}
        onClose={() => setIsEditTypeOpen(false)}
        productType={productType}
      />
    </div>
  );
}

import { useState } from 'react';
import ProductFormModal from '@/components/ProductFormModal';
import ProductFinishSummary from '@/components/ProductFinishSummary';
import { resolveFinish } from '@/utils/productFinish';
import { useProducts } from '@/hooks/useProducts';
import type { ProductType } from '@/hooks/useProductTypes';
import type { Product } from '@/types/product';
import { resolveImageUrl } from '@/utils/imageUrl';
import { buildProductFormCopy } from '@/utils/productTypeCopy';
import {
    formatDimensions,
    getCoverImage,
    getDiscountPercent,
    getEffectivePrice,
    getProductImages,
    hasDiscount,
} from '@/utils/productPricing';

interface AdminProductCardProps {
    product: Product;
    productType: ProductType;
    onDelete?: (id: string) => void;
}

/**
 * One card with two layouts, picked by the product type: `compact` is the
 * portrait card the chairs grid used, `wide` is the landscape card tables and
 * sofas used. Keeping both means seeding the built-in types reproduces exactly
 * what those hand-written pages rendered.
 */
export default function AdminProductCard({
    product,
    productType,
    onDelete,
}: AdminProductCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    // Mutations only — the list page already owns the fetch.
    const { updateProduct, isUpdating } = useProducts({ enabled: false });

    const imageCount = getProductImages(product).length;
    const discounted = hasDiscount(product);
    const dimensions = formatDimensions(product.dimensions);
    const finish = resolveFinish(product);

    const editModal = (
        <ProductFormModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            copy={buildProductFormCopy(productType, 'edit')}
            defaultColor={productType.colorPresets[0] ?? '#3a4d39'}
            productType={productType.slug}
            isSubmitting={isUpdating}
            product={product}
            onSubmit={(values) =>
                updateProduct({ ...product, ...values, image: values.images[0] })
            }
        />
    );

    if (productType.cardLayout === 'wide') {
        return (
            <>
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-white/50 group hover:scale-[1.01] transition-all duration-300 flex flex-col md:flex-row col-span-1 md:col-span-2 md:h-[300px]">
                    {/* Image Section — fixed aspect on mobile, fixed card height on md+ */}
                    <div className="aspect-[4/3] shrink-0 md:aspect-auto md:w-1/2 md:h-full relative overflow-hidden bg-oatmeal">
                        <img
                            src={resolveImageUrl(getCoverImage(product))}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-soft flex items-baseline gap-2">
                            <span className={`font-black text-sm ${discounted ? 'text-clay' : 'text-forest-moss'}`}>
                                Rs {getEffectivePrice(product)}
                            </span>
                            {discounted && (
                                <span className="text-[11px] font-bold text-forest-moss/40 line-through">
                                    Rs {product.price}
                                </span>
                            )}
                        </div>
                        {discounted && (
                            <div className="absolute top-4 right-4 bg-clay text-white px-3 py-1.5 rounded-full shadow-soft text-[10px] font-black uppercase tracking-widest">
                                {getDiscountPercent(product)}% off
                            </div>
                        )}
                        {imageCount > 1 && (
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-soft flex items-center gap-1 text-forest-moss">
                                <span className="material-symbols-outlined !text-sm">photo_library</span>
                                <span className="text-[11px] font-black">{imageCount}</span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:w-1/2 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-forest-moss tracking-tight">
                                    {product.name}
                                </h3>
                                <ProductFinishSummary
                                    finish={finish}
                                    size="md"
                                    showLabels={false}
                                    className="shrink-0"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {product.subCategory && (
                                    <span className="bg-clay text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                        {product.subCategory}
                                    </span>
                                )}
                                {dimensions && (
                                    <span className="bg-forest-moss/5 text-forest-moss/60 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-forest-moss/5 flex items-center gap-1">
                                        <span className="material-symbols-outlined !text-xs">straighten</span>
                                        {dimensions}
                                    </span>
                                )}
                            </div>

                            <p className="text-forest-moss-light/70 text-sm font-medium leading-relaxed italic line-clamp-3">
                                "{product.description}"
                            </p>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(true)}
                                className="flex-1 bg-forest-moss text-white py-3.5 rounded-full font-black text-xs hover:bg-forest-moss-light transition-all uppercase tracking-widest shadow-soft"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={() => onDelete?.(product.id)}
                                className="size-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                </div>

                {editModal}
            </>
        );
    }

    return (
        <>
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-soft border border-white/50 group hover:scale-[1.02] transition-all duration-300">
                <div className="aspect-[4/5] overflow-hidden relative bg-oatmeal">
                    <img
                        src={resolveImageUrl(getCoverImage(product))}
                        alt={product.name}
                        className="block w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-soft text-right">
                        <span className={`font-black text-sm ${discounted ? 'text-clay' : 'text-forest-moss'}`}>
                            Rs {getEffectivePrice(product)}
                        </span>
                        {discounted && (
                            <span className="block text-[10px] font-bold text-forest-moss/40 line-through leading-none">
                                Rs {product.price}
                            </span>
                        )}
                    </div>
                    {discounted && (
                        <div className="absolute top-4 left-4 bg-clay text-white px-3 py-1.5 rounded-full shadow-soft text-[10px] font-black uppercase tracking-widest">
                            {getDiscountPercent(product)}% off
                        </div>
                    )}
                    {imageCount > 1 && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-soft flex items-center gap-1 text-forest-moss">
                            <span className="material-symbols-outlined !text-sm">photo_library</span>
                            <span className="text-[11px] font-black">{imageCount}</span>
                        </div>
                    )}
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-forest-moss tracking-tight">
                            {product.name}
                        </h3>
                        <ProductFinishSummary
                            finish={finish}
                            size="sm"
                            showLabels={false}
                            className="shrink-0"
                        />
                    </div>
                    {product.subCategory && (
                        <span className="inline-block bg-sage-soft text-forest-moss px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {product.subCategory}
                        </span>
                    )}
                    {dimensions && (
                        <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-forest-moss/40">
                            <span className="material-symbols-outlined !text-sm">straighten</span>
                            {dimensions}
                        </p>
                    )}
                    <p className="text-forest-moss-light/70 text-sm font-medium leading-relaxed line-clamp-2">
                        {product.description}
                    </p>
                    <div className="pt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditOpen(true)}
                            className="flex-1 bg-sage-soft text-forest-moss py-2.5 rounded-full font-bold text-xs hover:bg-forest-moss-light hover:text-white transition-all uppercase tracking-widest"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete?.(product.id)}
                            className="px-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined !text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {editModal}
        </>
    );
}

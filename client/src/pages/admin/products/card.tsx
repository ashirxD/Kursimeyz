import { useState } from 'react';
import ProductCardView from '@/components/ProductCardView';
import ProductFinishSummary from '@/components/ProductFinishSummary';
import ProductFormModal from '@/components/ProductFormModal';
import ProductImageEditor from '@/components/ProductImageEditor';
import { isFinishEmpty, resolveFinish } from '@/utils/productFinish';
import { useProducts } from '@/hooks/useProducts';
import type { ProductType } from '@/hooks/useProductTypes';
import type { Product } from '@/types/product';
import { isDisplayableImageUrl } from '@/utils/imageUrl';
import {
    resolveCardAspect,
    withImageDisplay,
    type ImageDisplay,
} from '@/utils/productImageDisplay';
import { getProductImages } from '@/utils/productPricing';
import { buildProductFormCopy } from '@/utils/productTypeCopy';

interface AdminProductCardProps {
    product: Product;
    productType: ProductType;
    onDelete?: (id: string) => void;
}

/**
 * The shop's product card with the admin's controls under it.
 *
 * The card itself is ProductCardView — the very component the shop renders, fed
 * the same product and the same collection card shape — so the photo frame, its
 * crop, the badges and the text are what a shopper sees, not an approximation.
 * Only what sits around it is the admin's: a Top Pick star over the photo, and a
 * row of Edit / Adjust photo / Delete underneath.
 */
export default function AdminProductCard({
    product,
    productType,
    onDelete,
}: AdminProductCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    // Mutations only — the list page already owns the fetch.
    const { updateProduct, isUpdating, setTopPick, isSettingTopPick } = useProducts({
        enabled: false,
    });

    const aspect = resolveCardAspect(productType.cardAspect);
    const finish = resolveFinish(product);
    // Legacy relative paths cannot be loaded, so there is nothing to crop there.
    const photos = getProductImages(product).filter((url) => isDisplayableImageUrl(url));
    const canAdjust = photos.length > 0;

    // Saves just the framing, without opening the whole product form.
    const handleAdjust = async (changed: ImageDisplay[]) => {
        if (changed.length === 0) {
            setIsAdjustOpen(false);
            return;
        }

        const payload: Product = {
            ...product,
            image: getProductImages(product)[0],
            imageDisplay: changed.reduce(
                (list, next) => withImageDisplay(list, next),
                product.imageDisplay ?? [],
            ),
        };
        // The shelf flag is dropped from this payload: the server restamps a
        // Top Pick's date whenever it receives the flag, and a crop is not a
        // reason to move a product to the front of the shelf.
        delete payload.isTopPick;

        try {
            await updateProduct(payload);
            setIsAdjustOpen(false);
        } catch (error) {
            console.error('Failed to save photo adjustments:', error);
        }
    };

    // Marking is one click on the card rather than a field inside the edit form:
    // curating the home shelf is a pass across the whole grid, not a product edit.
    const topPickButton = (
        <button
            type="button"
            onClick={() =>
                setTopPick({ id: product.id, isTopPick: !product.isTopPick }).catch(
                    (error) => console.error('Failed to update top pick:', error)
                )
            }
            disabled={isSettingTopPick}
            aria-pressed={Boolean(product.isTopPick)}
            title={
                product.isTopPick
                    ? 'Remove from the storefront Top Picks'
                    : 'Show this on the storefront Top Picks shelf'
            }
            className={`absolute bottom-3 right-3 z-20 size-10 rounded-full backdrop-blur shadow-soft flex items-center justify-center transition-all disabled:opacity-50 ${
                product.isTopPick
                    ? 'bg-clay text-white'
                    : 'bg-white/90 text-forest-moss/40 hover:text-clay'
            }`}
        >
            <span
                className="material-symbols-outlined !text-lg"
                style={{
                    fontVariationSettings: product.isTopPick ? "'FILL' 1" : "'FILL' 0",
                }}
            >
                star
            </span>
        </button>
    );

    const controls = (
        <div className="mt-2.5 space-y-2">
            {(product.subCategory || !isFinishEmpty(finish)) && (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-0.5">
                    {product.subCategory ? (
                        <span className="inline-block bg-forest-moss/15 text-forest-moss px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {product.subCategory}
                        </span>
                    ) : (
                        <span />
                    )}
                    <ProductFinishSummary
                        finish={finish}
                        size="sm"
                        showLabels={false}
                        strong
                        className="shrink-0"
                    />
                </div>
            )}

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="flex-1 bg-forest-moss text-white py-2.5 rounded-full font-bold text-xs hover:bg-forest-moss-light transition-all uppercase tracking-widest shadow-soft"
                >
                    Edit
                </button>
                {canAdjust && (
                    <button
                        type="button"
                        onClick={() => setIsAdjustOpen(true)}
                        title="Crop and adjust photos"
                        aria-label="Crop and adjust photos"
                        className="px-3 bg-forest-moss/15 text-forest-moss rounded-full hover:bg-forest-moss hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined !text-sm">crop</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onDelete?.(product.id)}
                    title="Delete"
                    aria-label={`Delete ${product.name}`}
                    className="px-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined !text-sm">delete</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            <ProductCardView
                product={product}
                aspect={aspect}
                placeholderIcon={productType.icon}
                strong
                frameOverlay={topPickButton}
                footer={controls}
            />

            <ProductFormModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                copy={buildProductFormCopy(productType, 'edit')}
                defaultColor={productType.colorPresets[0] ?? '#3a4d39'}
                productType={productType.slug}
                cardAspect={aspect}
                isSubmitting={isUpdating}
                product={product}
                onSubmit={(values) =>
                    updateProduct({ ...product, ...values, image: values.images[0] })
                }
            />

            {isAdjustOpen && canAdjust && (
                <ProductImageEditor
                    images={photos}
                    aspect={aspect}
                    displays={product.imageDisplay ?? []}
                    applyLabel="Save"
                    isSaving={isUpdating}
                    onClose={() => setIsAdjustOpen(false)}
                    onApply={handleAdjust}
                />
            )}
        </>
    );
}

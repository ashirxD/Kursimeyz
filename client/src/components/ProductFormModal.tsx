import React, { useState } from 'react';
import CategoryCombobox from '@/components/CategoryCombobox';
import MaterialInput from '@/components/MaterialInput';
import ModalPortal from '@/components/ModalPortal';
import ProductDimensionsInput from '@/components/ProductDimensionsInput';
import ProductImagesUploader from '@/components/ProductImagesUploader';
import SwatchPicker from '@/components/SwatchPicker';
import { useCategories } from '@/hooks/useCategories';
import { useMaterials } from '@/hooks/useMaterials';
import {
    emptyFinish,
    resolveFinish,
    type FinishPart,
    type ProductFinish,
} from '@/utils/productFinish';
import { validateProductForm } from '@/utils/productFormValidation';
import {
    getDiscountPercent,
    getProductImages,
    type ProductDimensions,
} from '@/utils/productPricing';
import type { Product } from '@/types/product';

export interface ProductFormCopy {
    title: string;
    imagesLabel: string;
    namePlaceholder: string;
    pricePlaceholder: string;
    categoryPlaceholder: string;
    /** Swatch shortcuts offered for both the body and fabric colours. */
    colorPresets: string[];
    descriptionLabel: string;
    descriptionPlaceholder: string;
    submitLabel: string;
    submitPendingLabel: string;
}

export interface ProductFormValues {
    name: string;
    price: number;
    discountPrice: number | null;
    images: string[];
    description: string;
    /** Body and fabric colour + material. See utils/productFinish.ts. */
    finish: ProductFinish;
    dimensions: ProductDimensions;
    /** Category name; the server slugifies it and creates it if it is new. */
    subCategory: string;
}

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    copy: ProductFormCopy;
    defaultColor: string;
    /**
     * ProductType slug. Scopes the category dropdown, so chair "Slim" and sofa
     * "Slim" stay separate.
     */
    productType: string;
    isSubmitting: boolean;
    /** Existing product when editing; omitted when adding. */
    product?: Product;
    onSubmit: (values: ProductFormValues) => Promise<unknown>;
}

const emptyDimensions = (): ProductDimensions => ({ unit: 'cm' });

const toFormValues = (product: Product | undefined, defaultColor: string): ProductFormValues => {
    if (!product) {
        const finish = emptyFinish();
        // The type's first swatch seeds the fabric colour, which is where a
        // product's single colour used to live.
        finish.fabric.color = { hex: defaultColor, image: '' };

        return {
            name: '',
            price: 0,
            discountPrice: null,
            images: [],
            description: '',
            finish,
            dimensions: emptyDimensions(),
            subCategory: '',
        };
    }

    return {
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice ?? null,
        images: getProductImages(product),
        description: product.description,
        // Folds in the legacy single colour for products saved before the finish.
        finish: resolveFinish(product),
        dimensions: product.dimensions
            ? { ...product.dimensions, unit: product.dimensions.unit ?? 'cm' }
            : emptyDimensions(),
        // Products store the display name, so the field seeds without a lookup.
        subCategory: product.subCategory ?? '',
    };
};

/**
 * Mounting only while open means the form always opens seeded from the current
 * product — no reset effect, and no stale values from a previously edited item.
 */
export default function ProductFormModal(props: ProductFormModalProps) {
    if (!props.isOpen) return null;

    return <ProductForm key={props.product?.id ?? 'new'} {...props} />;
}

function ProductForm({
    onClose,
    copy,
    defaultColor,
    productType,
    isSubmitting,
    product,
    onSubmit,
}: ProductFormModalProps) {
    const [values, setValues] = useState<ProductFormValues>(() => toFormValues(product, defaultColor));
    const [isUploading, setIsUploading] = useState(false);
    const { categories, isLoading: isLoadingCategories } = useCategories(productType);
    const { materials, isLoading: isLoadingMaterials } = useMaterials();

    const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
        setValues((current) => ({ ...current, [key]: value }));
    };

    // Written out per part rather than keyed, so the finish stays fully typed.
    const setBody = (body: FinishPart) =>
        setValues((current) => ({ ...current, finish: { ...current.finish, body } }));

    const setFabric = (fabric: FinishPart) =>
        setValues((current) => ({ ...current, finish: { ...current.finish, fabric } }));

    const discountPercent = getDiscountPercent({
        price: values.price,
        discountPrice: values.discountPrice,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateProductForm(e.currentTarget, values.name, values.price, values.discountPrice)) return;
        if (values.images.length === 0) {
            alert('Please upload at least one image!');
            return;
        }

        try {
            await onSubmit(values);
            if (!product) {
                setValues(toFormValues(undefined, defaultColor));
            }
            onClose();
        } catch (error) {
            console.error(`Failed to save ${copy.title.toLowerCase()}:`, error);
        }
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-oatmeal w-full max-w-lg rounded-[2.5rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-forest-moss tracking-tight">{copy.title}</h3>
                            <button
                                onClick={onClose}
                                className="size-10 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <ProductImagesUploader
                                label={copy.imagesLabel}
                                images={values.images}
                                onChange={(images) => update('images', images)}
                                onUploadingChange={setIsUploading}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                        Name <span className="text-clay">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        minLength={1}
                                        className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                        placeholder={copy.namePlaceholder}
                                        value={values.name}
                                        onChange={(e) => update('name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                        Price (Rs) <span className="text-clay">*</span>
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        step={1}
                                        className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                        placeholder={copy.pricePlaceholder}
                                        value={values.price || ''}
                                        onChange={(e) =>
                                            update('price', e.target.value === '' ? 0 : Number(e.target.value))
                                        }
                                    />
                                </div>
                            </div>

                            <CategoryCombobox
                                label="Category"
                                value={values.subCategory}
                                onChange={(subCategory) => update('subCategory', subCategory)}
                                categories={categories}
                                isLoading={isLoadingCategories}
                                placeholder={copy.categoryPlaceholder}
                            />

                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light">
                                        Discounted Price (Rs)
                                    </label>
                                    {discountPercent > 0 && (
                                        <span className="text-[9px] font-black uppercase tracking-widest text-clay">
                                            {discountPercent}% off
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    max={values.price > 0 ? values.price - 1 : undefined}
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder="Leave empty for no discount"
                                    value={values.discountPrice ?? ''}
                                    onChange={(e) =>
                                        update('discountPrice', e.target.value === '' ? null : Number(e.target.value))
                                    }
                                />
                                <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                                    Shoppers pay this price; the original shows struck through.
                                </p>
                            </div>

                            <ProductDimensionsInput
                                value={values.dimensions}
                                onChange={(dimensions) => update('dimensions', dimensions)}
                            />

                            <div className="space-y-4 border-t border-forest-moss/5 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-forest-moss/40 ml-4">
                                    Finish
                                </p>

                                <SwatchPicker
                                    label="Body Colour"
                                    presets={copy.colorPresets}
                                    value={values.finish.body.color}
                                    helper="The frame or structure. Leave it empty if this product has no separate body."
                                    onChange={(color) => setBody({ ...values.finish.body, color })}
                                />

                                <MaterialInput
                                    label="Body Material"
                                    value={values.finish.body.material}
                                    suggestions={materials.body}
                                    isLoading={isLoadingMaterials}
                                    placeholder="e.g. Solid Oak"
                                    onChange={(material) =>
                                        setBody({ ...values.finish.body, material })
                                    }
                                />

                                <SwatchPicker
                                    label="Fabric Colour"
                                    presets={copy.colorPresets}
                                    value={values.finish.fabric.color}
                                    helper="The upholstery or covering."
                                    onChange={(color) =>
                                        setFabric({ ...values.finish.fabric, color })
                                    }
                                />

                                <MaterialInput
                                    label="Fabric Material"
                                    value={values.finish.fabric.material}
                                    suggestions={materials.fabric}
                                    isLoading={isLoadingMaterials}
                                    placeholder="e.g. Linen"
                                    onChange={(material) =>
                                        setFabric({ ...values.finish.fabric, material })
                                    }
                                />

                                <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                                    Both appear on the product page and on every order that
                                    includes it. Materials you type are remembered as suggestions.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                    {copy.descriptionLabel}
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full bg-white px-5 py-4 rounded-3xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm resize-none"
                                    placeholder={copy.descriptionPlaceholder}
                                    value={values.description}
                                    onChange={(e) => update('description', e.target.value)}
                                />
                            </div>

                            <button
                                disabled={isSubmitting || isUploading}
                                type="submit"
                                className="w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? copy.submitPendingLabel : copy.submitLabel}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}

import React, { useState } from 'react';
import { AxiosError } from 'axios';
import IconPicker from '@/components/IconPicker';
import ModalPortal from '@/components/ModalPortal';
import ProductImagesUploader from '@/components/ProductImagesUploader';
import { useProductTypes, type CardLayout, type ProductType } from '@/hooks/useProductTypes';
import { pluralize } from '@/utils/slug';

interface ProductTypeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Existing type when editing; omitted when adding. */
    productType?: ProductType;
    /** Fired after a successful create, so the caller can navigate to it. */
    onCreated?: (productType: ProductType) => void;
}

interface FormValues {
    name: string;
    pluralName: string;
    icon: string;
    coverImage: string;
    heroTitle: string;
    heroSubtitle: string;
    tagline: string;
    cardLayout: CardLayout;
}

const toFormValues = (productType?: ProductType): FormValues => ({
    name: productType?.name ?? '',
    pluralName: productType?.pluralName ?? '',
    icon: productType?.icon ?? 'category',
    coverImage: productType?.coverImage ?? '',
    heroTitle: productType?.heroTitle ?? '',
    heroSubtitle: productType?.heroSubtitle ?? '',
    tagline: productType?.tagline ?? '',
    cardLayout: productType?.cardLayout ?? 'compact',
});

/**
 * Mounting only while open means the form always opens seeded from the current
 * type — no reset effect, and no stale values from a previously edited one.
 */
export default function ProductTypeFormModal(props: ProductTypeFormModalProps) {
    if (!props.isOpen) return null;

    return <ProductTypeForm key={props.productType?._id ?? 'new'} {...props} />;
}

const LAYOUT_OPTIONS: Array<{ value: CardLayout; label: string; hint: string }> = [
    { value: 'compact', label: 'Compact', hint: 'Portrait cards, 4 per row' },
    { value: 'wide', label: 'Wide', hint: 'Landscape cards, 2 per row' },
];

function ProductTypeForm({ onClose, productType, onCreated }: ProductTypeFormModalProps) {
    const { createProductType, updateProductType, isCreating, isUpdating } = useProductTypes();
    const [values, setValues] = useState<FormValues>(() => toFormValues(productType));
    // Once the admin edits the plural themselves, stop overwriting it.
    const [pluralTouched, setPluralTouched] = useState(Boolean(productType));
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = Boolean(productType);
    const isSubmitting = isCreating || isUpdating;

    const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setValues((current) => ({ ...current, [key]: value }));
    };

    const handleNameChange = (name: string) => {
        setValues((current) => ({
            ...current,
            name,
            pluralName: pluralTouched ? current.pluralName : pluralize(name),
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!values.name.trim()) {
            setError('A name is required.');
            return;
        }

        setError(null);

        try {
            if (productType) {
                await updateProductType({ id: productType._id, ...values });
            } else {
                const saved = await createProductType(values);
                onCreated?.(saved);
            }
            onClose();
        } catch (submitError) {
            const message =
                submitError instanceof AxiosError
                    ? (submitError.response?.data as { message?: string } | undefined)?.message
                    : undefined;
            setError(message || 'Could not save this product kind.');
        }
    };

    const singular = values.name.trim() || 'product';
    const plural = values.pluralName.trim() || pluralize(singular);

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-oatmeal w-full max-w-lg rounded-[2.5rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-forest-moss tracking-tight">
                                    {isEditing ? `Edit ${productType?.pluralName}` : 'Add Product Kind'}
                                </h3>
                                <p className="text-[11px] font-bold text-forest-moss/40 mt-1">
                                    {isEditing
                                        ? 'Renaming keeps existing products and links working.'
                                        : 'Gets its own admin tab, shop page and categories.'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 shrink-0 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                        Name <span className="text-clay">*</span>
                                    </label>
                                    <input
                                        required
                                        autoFocus
                                        type="text"
                                        maxLength={40}
                                        className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                        placeholder="e.g. Wardrobe"
                                        value={values.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                    />
                                    <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                                        One item — "Add New {singular}"
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                        Plural
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={40}
                                        className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                        placeholder={pluralize(values.name) || 'e.g. Wardrobes'}
                                        value={values.pluralName}
                                        onChange={(e) => {
                                            setPluralTouched(true);
                                            update('pluralName', e.target.value);
                                        }}
                                    />
                                    <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                                        Menus — "{plural} Collection"
                                    </p>
                                </div>
                            </div>

                            <IconPicker
                                label="Icon"
                                value={values.icon}
                                onChange={(icon) => update('icon', icon)}
                            />

                            <ProductImagesUploader
                                label="Collection Cover"
                                required={false}
                                maxImages={1}
                                images={values.coverImage ? [values.coverImage] : []}
                                onChange={(images) => update('coverImage', images[0] ?? '')}
                                onUploadingChange={setIsUploading}
                            />

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                    Shop Headline
                                </label>
                                <input
                                    type="text"
                                    maxLength={80}
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder={`Find your perfect ${singular.toLowerCase()}`}
                                    value={values.heroTitle}
                                    onChange={(e) => update('heroTitle', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                    Shop Intro
                                </label>
                                <textarea
                                    rows={2}
                                    maxLength={240}
                                    className="w-full bg-white px-5 py-4 rounded-3xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm resize-none"
                                    placeholder={`Browse our ${plural.toLowerCase()}, crafted for your space.`}
                                    value={values.heroSubtitle}
                                    onChange={(e) => update('heroSubtitle', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                    Homepage Tagline
                                </label>
                                <input
                                    type="text"
                                    maxLength={60}
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder={`Our ${plural} Collection`}
                                    value={values.tagline}
                                    onChange={(e) => update('tagline', e.target.value)}
                                />
                                <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                                    Shown under the name in "Find Your Space".
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                    Admin Card Layout
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {LAYOUT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => update('cardLayout', option.value)}
                                            className={`px-4 py-3 rounded-3xl border-2 text-left transition-all ${
                                                values.cardLayout === option.value
                                                    ? 'bg-white border-clay shadow-soft'
                                                    : 'bg-white/50 border-forest-moss/10 hover:border-forest-moss/30'
                                            }`}
                                        >
                                            <span className="block text-xs font-black text-forest-moss uppercase tracking-widest">
                                                {option.label}
                                            </span>
                                            <span className="block text-[9px] font-medium text-forest-moss/40 mt-0.5">
                                                {option.hint}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <p className="text-[11px] font-bold text-red-500 bg-red-50 rounded-2xl px-4 py-3">
                                    {error}
                                </p>
                            )}

                            <button
                                disabled={isSubmitting || isUploading}
                                type="submit"
                                className="w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting
                                    ? 'Saving...'
                                    : isEditing
                                      ? 'Save Changes'
                                      : `Create ${values.name.trim() || 'Product Kind'}`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}

import type { ProductFormCopy } from '@/components/ProductFormModal';
import type { ProductType } from '@/hooks/useProductTypes';

/**
 * Builds the product form's copy from a type's names. These strings used to be
 * hand-written constants in each add/edit file; deriving them means a newly
 * added kind reads just as well as the built-in ones with nothing to fill in.
 */
export function buildProductFormCopy(
    productType: ProductType,
    mode: 'add' | 'edit',
): ProductFormCopy {
    const { name } = productType;
    const lower = name.toLowerCase();

    return {
        title: mode === 'add' ? `Add New ${name}` : `Edit ${name}`,
        imagesLabel: `${name} Images`,
        namePlaceholder: `e.g. Nordic ${name}`,
        pricePlaceholder: String(Math.max(1, Math.round(productType.defaultMaxPrice / 3))),
        categoryPlaceholder: 'e.g. Slim',
        colorLabel: 'Color',
        colorPresets: productType.colorPresets,
        descriptionLabel: 'Description',
        descriptionPlaceholder: `Tell us about this ${lower}...`,
        submitLabel: mode === 'add' ? `Create ${name}` : `Update ${name}`,
        submitPendingLabel: mode === 'add' ? 'Creating...' : 'Updating...',
    };
}

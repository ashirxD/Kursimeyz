import { useProducts } from '@/hooks/useProducts';
import ProductFormModal, { type ProductFormCopy } from '@/components/ProductFormModal';
import type { Chair as Product } from '../chairs/cards';

const TABLE_COLOR_PRESETS = ['#4b3621', '#8b4513', '#d2b48c', '#deb887', '#3a4d39'];

const EDIT_TABLE_COPY: ProductFormCopy = {
    title: 'Edit Table',
    imagesLabel: 'Table Images',
    namePlaceholder: 'e.g. Oak Dining Table',
    pricePlaceholder: '850',
    colorLabel: 'Wood / Color',
    colorPresets: TABLE_COLOR_PRESETS,
    descriptionLabel: 'Craftsmanship Details',
    descriptionPlaceholder: 'Describe the wood quality and finish...',
    submitLabel: 'Update Table',
    submitPendingLabel: 'Updating...',
};

interface EditTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: Product;
}

export default function EditTableModal({ isOpen, onClose, table }: EditTableModalProps) {
    const { updateProduct, isUpdating } = useProducts();

    return (
        <ProductFormModal
            isOpen={isOpen}
            onClose={onClose}
            copy={EDIT_TABLE_COPY}
            defaultColor="#4b3621"
            isSubmitting={isUpdating}
            product={table}
            onSubmit={(values) =>
                updateProduct({ ...table, ...values, image: values.images[0] })
            }
        />
    );
}

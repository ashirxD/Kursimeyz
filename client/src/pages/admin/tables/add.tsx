import { useProducts } from '@/hooks/useProducts';
import ProductFormModal, { type ProductFormCopy } from '@/components/ProductFormModal';

const TABLE_COLOR_PRESETS = ['#4b3621', '#8b4513', '#d2b48c', '#deb887', '#3a4d39'];

const ADD_TABLE_COPY: ProductFormCopy = {
    title: 'Add New Table',
    imagesLabel: 'Table Images',
    namePlaceholder: 'e.g. Oak Dining Table',
    pricePlaceholder: '850',
    colorLabel: 'Wood / Color',
    colorPresets: TABLE_COLOR_PRESETS,
    descriptionLabel: 'Craftsmanship Details',
    descriptionPlaceholder: 'Describe the wood quality and finish...',
    submitLabel: 'Register Table',
    submitPendingLabel: 'Creating...',
};

interface AddTableModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTableModal({ isOpen, onClose }: AddTableModalProps) {
    const { addProduct, isAdding } = useProducts();

    return (
        <ProductFormModal
            isOpen={isOpen}
            onClose={onClose}
            copy={ADD_TABLE_COPY}
            defaultColor="#4b3621"
            isSubmitting={isAdding}
            onSubmit={(values) =>
                addProduct({ ...values, image: values.images[0], category: 'table' })
            }
        />
    );
}

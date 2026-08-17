import { useProducts } from '@/hooks/useProducts';
import ProductFormModal, { type ProductFormCopy } from '@/components/ProductFormModal';

const CHAIR_COLOR_PRESETS = ['#3a4d39', '#d27d53', '#8a9a5b', '#4b3621', '#f5f0e6'];

const ADD_CHAIR_COPY: ProductFormCopy = {
    title: 'Add New Chair',
    imagesLabel: 'Chair Images',
    namePlaceholder: 'e.g. Nordic Oak',
    pricePlaceholder: '450',
    colorLabel: 'Color',
    colorPresets: CHAIR_COLOR_PRESETS,
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Tell us about this masterpiece...',
    submitLabel: 'Create Product',
    submitPendingLabel: 'Creating...',
};

interface AddChairModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddChairModal({ isOpen, onClose }: AddChairModalProps) {
    const { addProduct, isAdding } = useProducts();

    return (
        <ProductFormModal
            isOpen={isOpen}
            onClose={onClose}
            copy={ADD_CHAIR_COPY}
            defaultColor="#3a4d39"
            isSubmitting={isAdding}
            onSubmit={(values) =>
                addProduct({ ...values, image: values.images[0], category: 'chair' })
            }
        />
    );
}

import { useProducts } from '@/hooks/useProducts';
import ProductFormModal, { type ProductFormCopy } from '@/components/ProductFormModal';
import type { Chair as Product } from './cards';

const CHAIR_COLOR_PRESETS = ['#3a4d39', '#d27d53', '#8a9a5b', '#4b3621', '#f5f0e6'];

const EDIT_CHAIR_COPY: ProductFormCopy = {
    title: 'Edit Chair',
    imagesLabel: 'Chair Images',
    namePlaceholder: 'e.g. Nordic Oak',
    pricePlaceholder: '450',
    colorLabel: 'Color',
    colorPresets: CHAIR_COLOR_PRESETS,
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Tell us about this masterpiece...',
    submitLabel: 'Update Chair',
    submitPendingLabel: 'Updating...',
};

interface EditChairModalProps {
    isOpen: boolean;
    onClose: () => void;
    chair: Product;
}

export default function EditChairModal({ isOpen, onClose, chair }: EditChairModalProps) {
    const { updateProduct, isUpdating } = useProducts();

    return (
        <ProductFormModal
            isOpen={isOpen}
            onClose={onClose}
            copy={EDIT_CHAIR_COPY}
            defaultColor="#3a4d39"
            isSubmitting={isUpdating}
            product={chair}
            onSubmit={(values) =>
                updateProduct({ ...chair, ...values, image: values.images[0] })
            }
        />
    );
}

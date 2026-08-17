import { useProducts } from '@/hooks/useProducts';
import ProductFormModal, { type ProductFormCopy } from '@/components/ProductFormModal';
import type { Chair as Product } from '../chairs/cards';

const SOFA_COLOR_PRESETS = ['#4b3621', '#2c3e50', '#8e44ad', '#c0392b', '#27ae60', '#f1c40f'];

const EDIT_SOFA_COPY: ProductFormCopy = {
    title: 'Edit Sofa',
    imagesLabel: 'Sofa Images',
    namePlaceholder: 'e.g. Velvet Cloud Sofa',
    pricePlaceholder: '1200',
    colorLabel: 'Color Selection',
    colorPresets: SOFA_COLOR_PRESETS,
    descriptionLabel: 'Description',
    descriptionPlaceholder: "Describe the sofa's comfort and style...",
    submitLabel: 'Update Sofa',
    submitPendingLabel: 'Updating...',
};

interface EditSofaModalProps {
    isOpen: boolean;
    onClose: () => void;
    sofa: Product;
}

export default function EditSofaModal({ isOpen, onClose, sofa }: EditSofaModalProps) {
    const { updateProduct, isUpdating } = useProducts();

    return (
        <ProductFormModal
            isOpen={isOpen}
            onClose={onClose}
            copy={EDIT_SOFA_COPY}
            defaultColor="#4b3621"
            isSubmitting={isUpdating}
            product={sofa}
            onSubmit={(values) =>
                updateProduct({ ...sofa, ...values, image: values.images[0] })
            }
        />
    );
}

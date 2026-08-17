import { useProducts } from '@/hooks/useProducts';
import ProductFormModal, { type ProductFormCopy } from '@/components/ProductFormModal';

const SOFA_COLOR_PRESETS = ['#4b3621', '#2c3e50', '#8e44ad', '#c0392b', '#27ae60', '#f1c40f'];

const ADD_SOFA_COPY: ProductFormCopy = {
    title: 'Add New Sofa',
    imagesLabel: 'Sofa Images',
    namePlaceholder: 'e.g. Velvet Cloud Sofa',
    pricePlaceholder: '1200',
    colorLabel: 'Color Selection',
    colorPresets: SOFA_COLOR_PRESETS,
    descriptionLabel: 'Description',
    descriptionPlaceholder: "Describe the sofa's comfort and style...",
    submitLabel: 'Register Sofa',
    submitPendingLabel: 'Creating...',
};

interface AddSofaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddSofaModal({ isOpen, onClose }: AddSofaModalProps) {
    const { addProduct, isAdding } = useProducts();

    return (
        <ProductFormModal
            isOpen={isOpen}
            onClose={onClose}
            copy={ADD_SOFA_COPY}
            defaultColor="#4b3621"
            isSubmitting={isAdding}
            onSubmit={(values) =>
                addProduct({ ...values, image: values.images[0], category: 'sofa' })
            }
        />
    );
}

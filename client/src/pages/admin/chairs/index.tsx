import { useState } from 'react';
import Header from '@/components/admin-layout/Header';
import ChairCard from './cards';
import AddChairModal from './add';
import { useProducts } from '@/hooks/useProducts';

export default function ChairsPage() {
    const { products: chairs, isLoading, deleteProduct: deleteChair } = useProducts({ category: 'chair' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDeleteChair = async (id: string) => {
        try {
            await deleteChair(id);
        } catch (error) {
            console.error('Failed to delete chair:', error);
        }
    };

    if (isLoading && chairs.length === 0) {
        return (
            <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
                <Header />
                <div className="flex items-center justify-center h-64">
                    <div className="text-forest-moss font-bold animate-pulse">Loading Collection...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
            <Header />

            <div className="flex flex-col gap-6">
                {/* Page Title & Add Button */}
                <div className="flex justify-between items-center px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-forest-moss tracking-tight">Chairs Collection</h2>
                        <p className="text-forest-moss-light/70 font-bold text-sm">Manage and showcase your wood-carved masterpieces.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-clay text-white px-6 py-3 rounded-full font-black text-sm flex items-center gap-2 hover:bg-clay-soft hover:text-clay transition-all shadow-soft border border-clay"
                    >
                        <span className="material-symbols-outlined !text-xl">add</span>
                        ADD NEW CHAIR
                    </button>
                </div>

                {/* Chairs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                    {chairs.map((chair) => (
                        <ChairCard
                            key={chair.id}
                            chair={chair}
                            onDelete={handleDeleteChair}
                        />
                    ))}
                </div>

                {chairs.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-forest-moss/10">
                        <span className="material-symbols-outlined !text-6xl text-forest-moss/20 mb-4">chair</span>
                        <p className="text-forest-moss/40 font-bold">No chairs in your collection yet.</p>
                    </div>
                )}
            </div>

            {/* Add Chair Modal */}
            <AddChairModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

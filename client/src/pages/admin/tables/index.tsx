import { useState } from 'react';
import Header from '@/components/admin-layout/Header';
import TableCard from './cards';
import AddTableModal from './add';
import { useProducts } from '@/hooks/useProducts';

export default function TablesPage() {
    const { products: tables, isLoading, deleteProduct: deleteTable } = useProducts({ category: 'table' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDeleteTable = async (id: string) => {
        try {
            await deleteTable(id);
        } catch (error) {
            console.error('Failed to delete table:', error);
        }
    };

    if (isLoading && tables.length === 0) {
        return (
            <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
                <Header />
                <div className="flex items-center justify-center h-64">
                    <div className="text-forest-moss font-bold animate-pulse">Loading Tables...</div>
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
                        <h2 className="text-3xl font-black text-forest-moss tracking-tight">Tables Collection</h2>
                        <p className="text-forest-moss-light/70 font-bold text-sm">Large-scale wood carvings for dining and work.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-clay text-white px-6 py-3 rounded-full font-black text-sm flex items-center gap-2 hover:bg-clay-soft hover:text-clay transition-all shadow-soft border border-clay"
                    >
                        <span className="material-symbols-outlined !text-xl">add</span>
                        ADD NEW TABLE
                    </button>
                </div>

                {/* Tables Grid - Using 2 columns for wider cards */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-2">
                    {tables.map((table) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onDelete={handleDeleteTable}
                        />
                    ))}
                </div>

                {tables.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-4xl border-2 border-dashed border-forest-moss/10">
                        <span className="material-symbols-outlined !text-6xl text-forest-moss/20 mb-4">table_restaurant</span>
                        <p className="text-forest-moss/40 font-bold">No tables in your collection yet.</p>
                    </div>
                )}
            </div>

            {/* Add Table Modal */}
            <AddTableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

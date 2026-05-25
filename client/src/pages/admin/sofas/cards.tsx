import { useState } from 'react';
import type { Chair as Product } from '../chairs/cards';
import EditSofaModal from './edit.tsx';
import { resolveImageUrl } from '@/utils/imageUrl';

interface SofaCardProps {
    sofa: Product;
    onDelete?: (id: string) => void;
}

export default function SofaCard({ sofa, onDelete }: SofaCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-white/50 group hover:scale-[1.01] transition-all duration-300 flex flex-col md:flex-row col-span-1 md:col-span-2 md:h-[300px]">
                {/* Image Section — fixed aspect on mobile, fixed card height on md+ */}
                <div className="aspect-[4/3] shrink-0 md:aspect-auto md:w-1/2 md:h-full relative overflow-hidden bg-oatmeal">
                    <img
                        src={resolveImageUrl(sofa.image)}
                        alt={sofa.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-soft">
                        <span className="text-forest-moss font-black text-sm">Rs {sofa.price}</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:w-1/2 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-forest-moss tracking-tight">{sofa.name}</h3>
                            <div className="size-5 rounded-full border border-black/5 shadow-inner" style={{ backgroundColor: sofa.color }} />
                        </div>

                        <div className="flex gap-2">
                            <span className="bg-sage-soft/30 text-forest-moss text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-forest-moss/5">
                                Premium
                            </span>
                            <span className="bg-clay/5 text-clay text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-clay/5">
                                Fabric
                            </span>
                        </div>

                        <p className="text-forest-moss-light/70 text-sm font-medium leading-relaxed italic">
                            "{sofa.description}"
                        </p>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex-1 bg-forest-moss text-white py-3.5 rounded-full font-black text-xs hover:bg-forest-moss-light transition-all uppercase tracking-widest shadow-soft"
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={() => onDelete?.(sofa.id)}
                            className="size-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Sofa Modal */}
            <EditSofaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                sofa={sofa}
            />
        </>
    );
}

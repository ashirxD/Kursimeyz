import { useState } from 'react';
import { resolveImageUrl } from '@/utils/imageUrl';
import {
    formatDimensions,
    getCoverImage,
    getDiscountPercent,
    getEffectivePrice,
    getProductImages,
    hasDiscount,
    type ProductDimensions,
} from '@/utils/productPricing';
import EditChairModal from './edit';

export interface Chair {
    id: string;
    name: string;
    price: number;
    discountPrice?: number | null;
    image: string;
    images?: string[];
    description: string;
    dimensions?: ProductDimensions | null;
    color: string;
    category?: 'chair' | 'table' | 'sofa' | 'bed' | 'other';
    averageRating?: number;
    ratingCount?: number;
}

interface ChairCardProps {
    chair: Chair;
    onDelete?: (id: string) => void;
}

export default function ChairCard({ chair, onDelete }: ChairCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const imageCount = getProductImages(chair).length;
    const discounted = hasDiscount(chair);
    const dimensions = formatDimensions(chair.dimensions);

    return (
        <>
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-soft border border-white/50 group hover:scale-[1.02] transition-all duration-300">
            <div className="aspect-[4/5] overflow-hidden relative bg-oatmeal">
                <img
                    src={resolveImageUrl(getCoverImage(chair))}
                    alt={chair.name}
                    className="block w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-soft text-right">
                    <span className={`font-black text-sm ${discounted ? 'text-clay' : 'text-forest-moss'}`}>
                        Rs {getEffectivePrice(chair)}
                    </span>
                    {discounted && (
                        <span className="block text-[10px] font-bold text-forest-moss/40 line-through leading-none">
                            Rs {chair.price}
                        </span>
                    )}
                </div>
                {discounted && (
                    <div className="absolute top-4 left-4 bg-clay text-white px-3 py-1.5 rounded-full shadow-soft text-[10px] font-black uppercase tracking-widest">
                        {getDiscountPercent(chair)}% off
                    </div>
                )}
                {imageCount > 1 && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-soft flex items-center gap-1 text-forest-moss">
                        <span className="material-symbols-outlined !text-sm">photo_library</span>
                        <span className="text-[11px] font-black">{imageCount}</span>
                    </div>
                )}
            </div>
            <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-forest-moss tracking-tight">{chair.name}</h3>
                    <div className="size-4 rounded-full border border-black/5 shadow-inner" style={{ backgroundColor: chair.color }} />
                </div>
                {dimensions && (
                    <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-forest-moss/40">
                        <span className="material-symbols-outlined !text-sm">straighten</span>
                        {dimensions}
                    </p>
                )}
                <p className="text-forest-moss-light/70 text-sm font-medium leading-relaxed line-clamp-2">
                    {chair.description}
                </p>
                <div className="pt-2 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex-1 bg-sage-soft text-forest-moss py-2.5 rounded-full font-bold text-xs hover:bg-forest-moss-light hover:text-white transition-all uppercase tracking-widest"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete?.(chair.id)}
                        className="px-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined !text-sm">delete</span>
                    </button>
                </div>
            </div>
        </div>

        <EditChairModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            chair={chair}
        />
        </>
    );
}

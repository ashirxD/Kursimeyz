import React, { useState, useRef, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import api from '@/utils/Axios';
import { resolveImageUrl } from '@/utils/imageUrl';
import ProductColorPicker from '@/components/ProductColorPicker';
import { validateProductForm } from '@/utils/productFormValidation';
import type { Chair as Product } from '../chairs/cards';

const TABLE_COLOR_PRESETS = ['#4b3621', '#8b4513', '#d2b48c', '#deb887', '#3a4d39'];

interface EditTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: Product;
}

export default function EditTableModal({ isOpen, onClose, table }: EditTableModalProps) {
    const { updateProduct, isUpdating } = useProducts();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [editedTable, setEditedTable] = useState({
        name: table.name,
        price: table.price,
        image: table.image,
        description: table.description,
        color: table.color,
    });

    useEffect(() => {
        setEditedTable({
            name: table.name,
            price: table.price,
            image: table.image,
            description: table.description,
            color: table.color,
        });
        setPreviewUrl(null);
    }, [table, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large! Max 5MB.');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/upload', formData);

            setEditedTable({ ...editedTable, image: response.data.url });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateProductForm(e.currentTarget, editedTable.name, editedTable.price)) return;
        try {
            await updateProduct({ ...table, ...editedTable });
            onClose();
        } catch (error) {
            console.error('Failed to update table:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-oatmeal w-full max-w-lg rounded-[2.5rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-forest-moss tracking-tight">Edit Table</h3>
                        <button
                            onClick={onClose}
                            className="size-10 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Table Image</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative aspect-video rounded-3xl border-2 border-dashed border-forest-moss/20 bg-white/50 flex flex-col items-center justify-center cursor-pointer hover:border-clay/50 transition-all overflow-hidden"
                            >
                                {(previewUrl || editedTable.image) ? (
                                    <>
                                        <img src={previewUrl || resolveImageUrl(editedTable.image)} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white font-black text-xs uppercase tracking-widest">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="size-12 rounded-full bg-oatmeal flex items-center justify-center text-forest-moss-light mb-2 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined !text-3xl">add_photo_alternate</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-forest-moss/40 uppercase tracking-widest">Click to upload photo</p>
                                    </>
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                        <div className="size-8 border-4 border-clay border-t-transparent rounded-full animate-spin mb-2" />
                                        <span className="text-[10px] font-black text-clay uppercase tracking-widest">Uploading...</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                    Name <span className="text-clay">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    minLength={1}
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder="e.g. Oak Dining Table"
                                    value={editedTable.name}
                                    onChange={(e) => setEditedTable({ ...editedTable, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                                    Price (Rs) <span className="text-clay">*</span>
                                </label>
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    step={1}
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder="850"
                                    value={editedTable.price || ''}
                                    onChange={(e) =>
                                        setEditedTable({
                                            ...editedTable,
                                            price: e.target.value === '' ? 0 : Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <ProductColorPicker
                            label="Wood / Color"
                            presets={TABLE_COLOR_PRESETS}
                            value={editedTable.color}
                            onChange={(color) => setEditedTable({ ...editedTable, color })}
                        />

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Craftsmanship Details</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-white px-5 py-4 rounded-3xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm resize-none"
                                placeholder="Describe the dimensions and wood quality..."
                                value={editedTable.description}
                                onChange={(e) => setEditedTable({ ...editedTable, description: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={isUpdating || isUploading}
                            type="submit"
                            className="w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Update Table'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

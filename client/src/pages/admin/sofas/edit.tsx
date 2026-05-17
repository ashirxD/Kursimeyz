import React, { useState, useRef, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import api from '@/utils/Axios';
import type { Chair as Product } from '../chairs/cards';

interface EditSofaModalProps {
    isOpen: boolean;
    onClose: () => void;
    sofa: Product;
}

export default function EditSofaModal({ isOpen, onClose, sofa }: EditSofaModalProps) {
    const { updateProduct, isUpdating } = useProducts();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [editedSofa, setEditedSofa] = useState({
        name: sofa.name,
        price: sofa.price,
        image: sofa.image,
        description: sofa.description,
        color: sofa.color,
    });

    useEffect(() => {
        setEditedSofa({
            name: sofa.name,
            price: sofa.price,
            image: sofa.image,
            description: sofa.description,
            color: sofa.color,
        });
        setPreviewUrl(null);
    }, [sofa, isOpen]);

    if (!isOpen) return null;

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
        return `${baseUrl}${url}`;
    };

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

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setEditedSofa({ ...editedSofa, image: response.data.url });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProduct({ ...sofa, ...editedSofa });
            onClose();
        } catch (error) {
            console.error('Failed to update sofa:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-oatmeal w-full max-w-lg rounded-[2.5rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-forest-moss tracking-tight">Edit Sofa</h3>
                        <button
                            onClick={onClose}
                            className="size-10 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Sofa Image</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative aspect-video rounded-3xl border-2 border-dashed border-forest-moss/20 bg-white/50 flex flex-col items-center justify-center cursor-pointer hover:border-clay/50 transition-all overflow-hidden"
                            >
                                {(previewUrl || editedSofa.image) ? (
                                    <>
                                        <img src={previewUrl || getImageUrl(editedSofa.image)} className="w-full h-full object-cover" alt="Preview" />
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
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder="e.g. Velvet Cloud Sofa"
                                    value={editedSofa.name}
                                    onChange={(e) => setEditedSofa({ ...editedSofa, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Price (Rs)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder="1200"
                                    value={editedSofa.price}
                                    onChange={(e) => setEditedSofa({ ...editedSofa, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Color Selection</label>
                            <div className="flex gap-2 p-1.5 bg-white rounded-full border border-forest-moss/10">
                                {['#4b3621', '#2c3e50', '#8e44ad', '#c0392b', '#27ae60', '#f1c40f'].map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setEditedSofa({ ...editedSofa, color: c })}
                                        className={`size-8 rounded-full border-2 transition-all ${editedSofa.color === c ? 'border-clay scale-110 shadow-soft' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Description</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-white px-5 py-4 rounded-3xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm resize-none"
                                placeholder="Describe the sofa's comfort and style..."
                                value={editedSofa.description}
                                onChange={(e) => setEditedSofa({ ...editedSofa, description: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={isUpdating || isUploading}
                            type="submit"
                            className="w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Update Sofa'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

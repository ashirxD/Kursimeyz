import React, { useState, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import api from '@/utils/Axios';

interface AddTableModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTableModal({ isOpen, onClose }: AddTableModalProps) {
    const { addProduct, isAdding } = useProducts();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [newTable, setNewTable] = useState({
        name: '',
        price: 0,
        image: '',
        description: '',
        color: '#4b3621',
    });

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

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setNewTable({ ...newTable, image: response.data.url });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTable.image) {
            alert('Please upload an image first!');
            return;
        }
        try {
            await addProduct({ ...newTable, category: 'table' });
            setNewTable({ name: '', price: 0, image: '', description: '', color: '#4b3621' });
            setPreviewUrl(null);
            onClose();
        } catch (error) {
            console.error('Failed to add table:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-oatmeal w-full max-w-lg rounded-[2.5rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-forest-moss tracking-tight">Add New Table</h3>
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
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
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
                                    placeholder="e.g. Oak Dining Table"
                                    value={newTable.name}
                                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Price ($)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-white px-5 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                    placeholder="850"
                                    value={newTable.price}
                                    onChange={(e) => setNewTable({ ...newTable, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Wood Selection</label>
                            <div className="flex gap-2 p-1.5 bg-white rounded-full border border-forest-moss/10">
                                {['#4b3621', '#8b4513', '#d2b48c', '#deb887', '#3a4d39'].map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setNewTable({ ...newTable, color: c })}
                                        className={`size-8 rounded-full border-2 transition-all ${newTable.color === c ? 'border-clay scale-110 shadow-soft' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Craftsmanship Details</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-white px-5 py-4 rounded-3xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm resize-none"
                                placeholder="Describe the dimensions and wood quality..."
                                value={newTable.description}
                                onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={isAdding || isUploading}
                            type="submit"
                            className="w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAdding ? 'Creating...' : 'Register Table'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

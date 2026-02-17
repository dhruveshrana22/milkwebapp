'use client';

import { useState } from 'react';
import { useData } from "@/context/DataContext";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    BeakerIcon,
    CubeIcon
} from "@heroicons/react/24/outline";

export default function Master() {
    const {
        milkTypes, addMilkType, updateMilkType, deleteMilkType,
        products, addProduct, updateProduct, deleteProduct
    } = useData();

    const [activeTab, setActiveTab] = useState('milk'); // 'milk' or 'products'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [milkForm, setMilkForm] = useState({ name: '', fat: '', unit: 'Liter', price: '' });
    const [productForm, setProductForm] = useState({ name: '', unit: 'kg', price: '', stock: '0' });

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            if (activeTab === 'milk') setMilkForm(item);
            else setProductForm(item);
        } else {
            setEditingItem(null);
            setMilkForm({ name: '', fat: '', unit: 'Liter', price: '' });
            setProductForm({ name: '', unit: 'kg', price: '', stock: '0' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'milk') {
            if (editingItem) updateMilkType(editingItem.id, milkForm);
            else addMilkType(milkForm);
        } else {
            if (editingItem) updateProduct(editingItem.id, productForm);
            else addProduct(productForm);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Master Management</h1>
                    <p className="text-gray-500">Configure your milk variants and products.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add New {activeTab === 'milk' ? 'Milk' : 'Product'}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-2xl w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab('milk')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'milk' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <BeakerIcon className="h-4 w-4" />
                    Milk Master
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <CubeIcon className="h-4 w-4" />
                    Product Master
                </button>
            </div>

            {/* Content Area */}
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                {activeTab === 'milk' ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Milk Variant</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Fat %</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {milkTypes.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-black text-gray-900 uppercase">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">{item.unit}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-600">{item.fat}%</td>
                                    <td className="px-6 py-4 font-black text-blue-600 text-lg">₹{item.price}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-blue-600"><PencilIcon className="h-5 w-5" /></button>
                                            <button onClick={() => deleteMilkType(item.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {milkTypes.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">No milk variants found. Click "Add New Milk" to start.</td></tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map(item => {
                                const isLow = parseFloat(item.stock) < 5;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-gray-900 uppercase">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.unit}</p>
                                        </td>
                                        <td className={`px-6 py-4 font-bold ${isLow ? 'text-red-500' : 'text-gray-600'}`}>
                                            {item.stock} {item.unit}
                                            {isLow && <span className="ml-2 px-2 py-0.5 bg-red-100 text-[8px] rounded-full">LOW</span>}
                                        </td>
                                        <td className="px-6 py-4 font-black text-blue-600 text-lg">₹{item.price}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-blue-600"><PencilIcon className="h-5 w-5" /></button>
                                                <button onClick={() => deleteProduct(item.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {products.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">No products found. Click "Add New Product" to start.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">{editingItem ? 'Edit' : 'Add New'} {activeTab === 'milk' ? 'Milk Variant' : 'Product'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'milk' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Milk Type</label>
                                        <input required className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all uppercase font-bold" value={milkForm.name} onChange={e => setMilkForm({ ...milkForm, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Fat %</label>
                                            <input required type="number" className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={milkForm.fat} onChange={e => setMilkForm({ ...milkForm, fat: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Unit</label>
                                            <select className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={milkForm.unit} onChange={e => setMilkForm({ ...milkForm, unit: e.target.value })}>
                                                <option>Liter</option><option>ml</option><option>kg</option><option>gram</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Price (Per Unit)</label>
                                        <input required type="number" className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={milkForm.price} onChange={e => setMilkForm({ ...milkForm, price: e.target.value })} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Product Name</label>
                                        <input required className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all uppercase font-bold" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Unit</label>
                                            <select className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })}>
                                                <option>kg</option><option>gram</option><option>Liter</option><option>ml</option><option>Piece</option><option>Packet</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Price</label>
                                            <input required type="number" className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Initial Stock</label>
                                        <input required type="number" className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-black text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-bold" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
                                    </div>
                                </>
                            )}

                            <button type="submit" className="w-full rounded-xl bg-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all">
                                {editingItem ? 'Update Master' : 'Create Master'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

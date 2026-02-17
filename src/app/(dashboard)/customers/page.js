'use client';

import { useState } from 'react';
import { useData } from "@/context/DataContext";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MapPinIcon,
    PhoneIcon,
    XMarkIcon,
    UsersIcon,
    BeakerIcon,
    CubeIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import Link from 'next/link';

export default function Customers() {
    const { customers, addCustomer, updateCustomer, deleteCustomer, milkTypes, products } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        defaultQty: '1',
        linkedProducts: [] // Array of { id, type, name, fat? }
    });

    const handleOpenModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                ...customer,
                linkedProducts: customer.linkedProducts || []
            });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', mobile: '', address: '', defaultQty: '1', linkedProducts: [] });
        }
        setIsModalOpen(true);
    };

    const toggleProductSelection = (item, type) => {
        const isSelected = formData.linkedProducts.find(p => p.id === item.id && p.type === type);
        if (isSelected) {
            setFormData({
                ...formData,
                linkedProducts: formData.linkedProducts.filter(p => !(p.id === item.id && p.type === type))
            });
        } else {
            setFormData({
                ...formData,
                linkedProducts: [...formData.linkedProducts, {
                    id: item.id,
                    type,
                    name: item.name,
                    fat: item.fat || null,
                    unit: item.unit
                }]
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            updateCustomer(editingCustomer.id, formData);
        } else {
            addCustomer(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Customers</h1>
                    <p className="text-gray-500 font-medium">Manage your milk delivery network.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Customer</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {customers.map((customer) => (
                    <div key={customer.id} className="group relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
                        <div className="mb-4">
                            <div className="flex items-start justify-between">
                                <Link href={`/customers/${customer.id}`} className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase truncate">{customer.name}</h3>
                                </Link>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(customer)} className="p-1.5 text-gray-400 hover:text-blue-600">
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteCustomer(customer.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{customer.mobile}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                                    <span className="truncate font-medium">{customer.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Linked Products Tags */}
                        {customer.linkedProducts && customer.linkedProducts.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-1.5 border-t border-gray-50 pt-4">
                                {customer.linkedProducts.map((p, idx) => (
                                    <span key={idx} className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${p.type === 'milk' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {p.name} {p.fat ? `(${p.fat}%)` : ''}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-2 border-t border-gray-50 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Default Milk</span>
                                <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">{customer.defaultQty} L</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {customers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400 shadow-inner">
                        <UsersIcon className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No customers found</h3>
                    <p className="mt-1 text-gray-500 font-medium">Start by adding your first delivery customer.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl rounded-[40px] bg-white p-8 shadow-2xl ring-1 ring-gray-100 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editingCustomer ? 'Edit Profile' : 'New Customer'}</h2>
                                <p className="text-sm font-medium text-gray-400">Setup customer preferences and products.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-2xl p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full rounded-2xl border-none px-5 py-4 text-sm text-black font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50 shadow-inner outline-none transition-all uppercase"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Mobile</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="9876..."
                                                className="w-full rounded-2xl border-none px-5 py-4 text-sm text-black font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50 shadow-inner outline-none transition-all"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Daily Liters</label>
                                            <input
                                                required
                                                type="number"
                                                step="0.5"
                                                className="w-full rounded-2xl border-none px-5 py-4 text-sm text-black font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50 shadow-inner outline-none transition-all"
                                                value={formData.defaultQty}
                                                onChange={(e) => setFormData({ ...formData, defaultQty: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Address</label>
                                        <textarea
                                            required
                                            rows="3"
                                            className="w-full rounded-2xl border-none px-5 py-4 text-sm text-black font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50 shadow-inner outline-none transition-all resize-none"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Product Selection */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Favorite Products</label>
                                    <div className="rounded-[32px] bg-gray-50 p-6 shadow-inner space-y-6 min-h-full">
                                        {/* Milk Section */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                                <BeakerIcon className="h-3 w-3" /> Milk Variants
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {milkTypes.map(m => {
                                                    const selected = formData.linkedProducts.find(p => p.id === m.id && p.type === 'milk');
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            type="button"
                                                            onClick={() => toggleProductSelection(m, 'milk')}
                                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-white text-gray-600 hover:border-blue-100'}`}
                                                        >
                                                            <div className="text-left">
                                                                <p className="text-[10px] font-black uppercase leading-tight">{m.name}</p>
                                                                <p className={`text-[9px] font-bold ${selected ? 'text-blue-100' : 'text-gray-400'}`}>{m.fat}% Fat</p>
                                                            </div>
                                                            {selected && <CheckCircleIcon className="h-4 w-4" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Products Section */}
                                        <div className="space-y-3 pt-4 border-t border-gray-200/50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                                <CubeIcon className="h-3 w-3" /> Dairy Products
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {products.map(p => {
                                                    const selected = formData.linkedProducts.find(i => i.id === p.id && i.type === 'product');
                                                    return (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => toggleProductSelection(p, 'product')}
                                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-white text-gray-600 hover:border-emerald-100'}`}
                                                        >
                                                            <p className="text-[10px] font-black uppercase tracking-tighter leading-tight text-left truncate pr-1">{p.name}</p>
                                                            {selected && <CheckCircleIcon className="h-4 w-4 shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-[24px] bg-blue-600 py-5 text-lg font-black text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] mt-4 flex items-center justify-center gap-3 tracking-tight"
                            >
                                {editingCustomer ? 'SYNC UPDATES' : 'SAVE CUSTOMER PROFILE'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
            `}</style>
        </div>
    );
}

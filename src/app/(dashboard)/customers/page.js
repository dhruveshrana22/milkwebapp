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
    CubeIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import Link from 'next/link';

export default function Customers() {
    const { customers, addCustomer, updateCustomer, deleteCustomer, products } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        defaultQty: '1',
        linkedProducts: [] // Array of { id, type, name }
    });

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm)
    );

    const [modalProductFilter, setModalProductFilter] = useState('All');

    const handleOpenModal = (customer = null) => {
        setModalProductFilter('All');
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

    const toggleProductSelection = (item) => {
        const isSelected = formData.linkedProducts.find(p => p.id === item.id);
        if (isSelected) {
            setFormData({
                ...formData,
                linkedProducts: formData.linkedProducts.filter(p => p.id !== item.id)
            });
        } else {
            setFormData({
                ...formData,
                linkedProducts: [...formData.linkedProducts, {
                    id: item.id,
                    type: 'product',
                    name: item.name,
                    unit: item.unit_type
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

    // Filtered products for modal
    const modalFilteredProducts = products.filter(p => {
        if (modalProductFilter === 'All') return true;
        return p.unit_type?.includes(modalProductFilter);
    });

    return (
        <div className="space-y-3 px-1 sm:px-0">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">Customers</h1>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Delivery Network</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[10px] font-black text-white shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">ADD CUSTOMER</span>
                    <span className="sm:hidden">ADD</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search name or mobile..."
                    className="w-full rounded-xl border-none bg-white p-3 pl-10 text-[11px] font-bold text-gray-900 shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Unified Table View */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Mobile</th>
                                {/* <th className="hidden md:table-cell px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Address</th>
                                <th className="hidden lg:table-cell px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Favorite Products</th>
                                <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Qty</th> */}
                                <th className="px-3 py-2 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors h-16">
                                    <td className="px-3 py-2.5">
                                        <Link href={`/customers/${customer.id}`} className="block min-w-0">
                                            <p className="text-[18px] font-black text-gray-900 uppercase truncate leading-none">{customer.name}</p>
                                        </Link>
                                    </td>
                                    <td className="hidden md:table-cell px-3 py-2.5 max-w-[200px]">
                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                                            <p className="text-[18px] font-bold text-gray-400 mt-0.5">{customer.mobile}</p>
                                        </div>
                                    </td>
                                    {/* <td className="hidden md:table-cell px-3 py-2.5 max-w-[200px]">
                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                                            <MapPinIcon className="h-3 w-3 text-gray-400 shrink-0" />
                                            <span className="truncate italic font-medium">{customer.address}</span>
                                        </div>
                                    </td>
                                    <td className="hidden lg:table-cell px-3 py-2.5">
                                        <div className="flex flex-wrap gap-1">
                                            {customer.linkedProducts?.map((p, idx) => (
                                                <span key={idx} className="whitespace-nowrap px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight bg-blue-50 text-blue-600 ring-1 ring-blue-100/50">
                                                    {p.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                        <span className="inline-block text-[9px] font-black text-blue-600 bg-blue-100/30 px-2 py-0.5 rounded-md min-w-[35px]">
                                            {customer.defaultQty}L
                                        </span>
                                    </td> */}
                                    <td className="px-3 py-2.5">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleOpenModal(customer)} className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors">
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => deleteCustomer(customer.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                                <TrashIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl ring-1 ring-gray-100 border-2 border-dashed border-gray-100">
                    <UsersIcon className="h-10 w-10 text-gray-200 mb-2" />
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">No customers found</h3>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{editingCustomer ? 'Edit Profile' : 'New Customer'}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Setup Customer Settings</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-xl bg-gray-50 p-2.5 text-gray-400 hover:text-gray-900 transition-all">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Section 1: Personal Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-5 w-1 rounded-full bg-blue-600"></div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personal Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Customer Full Name"
                                                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="Mobile Number"
                                                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    step="0.5"
                                                    placeholder="Default Qty (L)"
                                                    className="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    value={formData.defaultQty}
                                                    onChange={(e) => setFormData({ ...formData, defaultQty: e.target.value })}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">litres</span>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <textarea
                                                required
                                                rows="2"
                                                placeholder="Full Delivery Address"
                                                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Product Connection */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-1 rounded-full bg-blue-600"></div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Favorite Products</h3>
                                        </div>
                                        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                            {['All', 'Litre', 'Kg', 'Pcs'].map(unit => (
                                                <button
                                                    key={unit}
                                                    type="button"
                                                    onClick={() => setModalProductFilter(unit)}
                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${modalProductFilter === unit ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                >
                                                    {unit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {modalFilteredProducts.map(p => {
                                            const selected = formData.linkedProducts.find(i => i.id === p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => toggleProductSelection(p)}
                                                    className={`group relative flex flex-col items-start p-3 rounded-2xl border-2 transition-all ${selected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 border-gray-50 text-gray-600 hover:border-blue-100 active:scale-95'}`}
                                                >
                                                    <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${selected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {p.unit_type?.split(' ')[0]}
                                                    </span>
                                                    <p className={`text-[10px] font-black uppercase tracking-tight leading-tight text-left line-clamp-1 ${selected ? 'text-white' : 'text-gray-900'}`}>
                                                        {p.name}
                                                    </p>
                                                    {selected && (
                                                        <div className="absolute top-1 right-1">
                                                            <CheckCircleIcon className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        {modalFilteredProducts.length === 0 && (
                                            <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No match</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer Actions */}
                                <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-50 mt-10">
                                    <button
                                        type="submit"
                                        className="w-full rounded-2xl bg-blue-600 py-5 text-sm font-black text-white shadow-2xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 tracking-widest"
                                    >
                                        {editingCustomer ? 'SYNC UPDATES' : 'SAVE CUSTOMER PROFILE'}
                                    </button>
                                </div>
                            </form>
                        </div>
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

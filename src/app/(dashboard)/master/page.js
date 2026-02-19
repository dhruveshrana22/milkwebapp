'use client';

import { useState, useEffect } from 'react';
import { useData } from "@/context/DataContext";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    PhotoIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

const UNIT_TYPES = {
    LITRE: {
        label: 'Litre (L)',
        subUnit: 'mL',
        conversion: '1 Litre (L) = 1,000 Millilitres (mL)',
        variants: ['100 mL', '200 mL', '250 mL', '500 mL', '750 mL', '1 L']
    },
    KILOGRAM: {
        label: 'Kilogram (Kg)',
        subUnit: 'g',
        conversion: '1 Kilogram (Kg) = 1,000 Grams (g)',
        variants: ['100 g', '200 g', '250 g', '500 g', '750 g', '1 Kg']
    },
    PIECES: {
        label: 'Pieces (Pcs)',
        modes: ['Sold by Piece Count', 'Sold by Weight Pack'],
        variants_weight: ['100 g', '200 g', '250 g', '500 g', '1 Kg']
    }
};

export default function ProductEntry() {
    const {
        products, addProduct, updateProduct, deleteProduct,
        categories, addCategory, updateCategory, deleteCategory
    } = useData();

    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Product Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        sale_price: '',
        description: '',
        unit_type: 'Litre (L)',
        variant_type: 'Sold by Piece Count',
        base_price: '',
        variant_list: UNIT_TYPES.LITRE.variants.map(v => ({ label: v, price: '0.00' })),
        custom_variant_allowed: true
    });

    // Category Form State
    const [categoryName, setCategoryName] = useState('');

    // Searchable Dropdown State
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const [catSearch, setCatSearch] = useState('');

    const filteredProducts = products.filter(p =>
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.unit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredCategories = categories.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            sale_price: '',
            description: '',
            unit_type: 'Litre (L)',
            variant_type: 'Sold by Piece Count',
            base_price: '',
            variant_list: UNIT_TYPES.LITRE.variants.map(v => ({ label: v, price: '0.00' })),
            custom_variant_allowed: true
        });
        setEditingProduct(null);
        setCategoryName('');
        setEditingCategory(null);
    };

    const handleOpenModal = (item = null) => {
        if (activeTab === 'products') {
            if (item) {
                setEditingProduct(item);
                setFormData(item);
            } else {
                resetForm();
            }
        } else {
            if (item) {
                setEditingCategory(item);
                setCategoryName(item.name);
            } else {
                resetForm();
            }
        }
        setIsModalOpen(true);
    };

    const calculatePrice = (variantLabel, basePriceOverride = null) => {
        const baseVal = basePriceOverride !== null ? basePriceOverride : formData.base_price;
        if (!baseVal) return 0;
        const base = parseFloat(baseVal);

        const match = variantLabel.match(/(\d+\.?\d*)\s*(\w+)/);
        if (!match) return base;

        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();

        if (unit === 'ml' || unit === 'g') {
            return (value / 1000) * base;
        } else if (unit === 'l' || unit === 'kg') {
            return value * base;
        }
        return base;
    };

    const toggleVariant = (variantLabel) => {
        setFormData(prev => {
            const exists = prev.variant_list.find(v => v.label === variantLabel);
            if (exists) {
                return { ...prev, variant_list: prev.variant_list.filter(v => v.label !== variantLabel) };
            } else {
                return {
                    ...prev,
                    variant_list: [...prev.variant_list, {
                        label: variantLabel,
                        price: calculatePrice(variantLabel).toFixed(2)
                    }]
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'products') {
            if (editingProduct) {
                updateProduct(editingProduct.id, formData);
            } else {
                addProduct(formData);
            }
        } else {
            if (editingCategory) {
                updateCategory(editingCategory.id, { name: categoryName });
            } else {
                addCategory({ name: categoryName });
            }
        }
        setIsModalOpen(false);
        resetForm();
    };

    const getAvailableVariants = (unitType = formData.unit_type, variantType = formData.variant_type) => {
        if (unitType === 'Litre (L)') return UNIT_TYPES.LITRE.variants;
        if (unitType === 'Kilogram (Kg)') return UNIT_TYPES.KILOGRAM.variants;
        if (unitType === 'Pieces (Pcs)') {
            if (variantType === 'Sold by Weight Pack') return UNIT_TYPES.PIECES.variants_weight;
            return [];
        }
        return [];
    };

    const updateAllVariants = (newBasePrice, unitType, variantType) => {
        const variants = getAvailableVariants(unitType, variantType);
        return variants.map(v => ({
            label: v,
            price: calculatePrice(v, newBasePrice).toFixed(2)
        }));
    };

    return (
        <div className="space-y-4 px-1 sm:px-2">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-gray-900 leading-none">Inventory</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Catalog & Structure</p>

                    {/* Compact Tabs */}
                    <div className="flex gap-1 mt-4 bg-gray-100 p-0.5 rounded-lg w-fit">
                        <button
                            onClick={() => { setActiveTab('products'); resetForm(); }}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight transition-all ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => { setActiveTab('categories'); resetForm(); }}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight transition-all ${activeTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Categories
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                        <input
                            type="text"
                            placeholder={activeTab === 'products' ? "Search products..." : "Search categories..."}
                            className="w-full rounded-xl border-none bg-white p-2.5 pl-9 text-[11px] font-bold text-gray-900 shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <ArrowPathIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[10px] font-black text-white shadow-lg shadow-blue-100 transition-all active:scale-95 shrink-0"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>{activeTab === 'products' ? 'CREATE' : 'NEW CATEGORY'}</span>
                    </button>
                </div>
            </div>

            {/* List and Category Logic */}
            {activeTab === 'products' ? (
                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Product Name</th>
                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Category</th>
                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Unit Type</th>
                                    <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Variants</th>
                                    <th className="px-3 py-2 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">Price</th>
                                    <th className="px-3 py-2 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-900 uppercase leading-none">{product.name}</span>
                                                {product.description && <span className="text-[9px] text-gray-400 font-medium truncate max-w-[150px] mt-1">{product.description}</span>}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {product.category || 'NO CATEGORY'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase whitespace-nowrap">
                                                {product.unit_type?.split(' ')[0]}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex justify-center gap-1">
                                                <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {product.variant_list?.length || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className="text-[11px] font-black text-gray-900">₹{product.sale_price}</span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleOpenModal(product)} className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors">
                                                    <PencilIcon className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-10 text-center">
                                            <div className="flex flex-col items-center opacity-30">
                                                <PlusIcon className="h-8 w-8 text-gray-400" />
                                                <p className="text-[10px] font-black uppercase tracking-widest mt-2">No products found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Category List */
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {filteredCategories.map(cat => (
                        <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <InformationCircleIcon className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{cat.name}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                        {products.filter(p => p.category === cat.name).length} Products
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-gray-300 hover:text-blue-600">
                                    <PencilIcon className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-gray-300 hover:text-red-500">
                                    <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredCategories.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-30">
                            <PlusIcon className="h-8 w-8 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2">No categories found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Compact Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                                    {activeTab === 'products' ? (editingProduct ? 'Edit Product' : 'New Product') : (editingCategory ? 'Edit Category' : 'New Category')}
                                </h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Management Console</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-lg bg-gray-50 p-2 text-gray-400 hover:text-gray-900 transition-all">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                            {activeTab === 'products' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Section 1: Basic Info */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-1 rounded-full bg-blue-600"></div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Basic Details</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Product Name</label>
                                                <input
                                                    required
                                                    placeholder="e.g. Buffalo Milk"
                                                    className="w-full rounded-xl border-none bg-gray-50 p-3 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Category</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                                                        className="w-full flex items-center justify-between rounded-xl border-none bg-gray-50 p-3 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    >
                                                        <span className={formData.category ? "text-gray-900" : "text-gray-400"}>
                                                            {formData.category || 'Select Category'}
                                                        </span>
                                                        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {isCatDropdownOpen && (
                                                        <div className="absolute z-[110] mt-2 w-full rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                            <div className="relative mb-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search category..."
                                                                    className="w-full rounded-lg border-none bg-gray-50 p-2 pl-8 text-[10px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-blue-500/20"
                                                                    value={catSearch}
                                                                    onChange={e => setCatSearch(e.target.value)}
                                                                    autoFocus
                                                                />
                                                                <ArrowPathIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                            </div>
                                                            <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, category: '' });
                                                                        setIsCatDropdownOpen(false);
                                                                        setCatSearch('');
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase"
                                                                >
                                                                    None / Select Category
                                                                </button>
                                                                {categories
                                                                    .filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
                                                                    .map(cat => (
                                                                        <button
                                                                            key={cat.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, category: cat.name });
                                                                                setIsCatDropdownOpen(false);
                                                                                setCatSearch('');
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-colors ${formData.category === cat.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                                                        >
                                                                            {cat.name}
                                                                        </button>
                                                                    ))}
                                                                {categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                                                                    <p className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase">No matches found</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Sale Price (₹)</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="w-full rounded-xl border-none bg-gray-50 p-3 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                        value={formData.sale_price}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sale_price: val,
                                                                base_price: val,
                                                                variant_list: updateAllVariants(val, prev.unit_type, prev.variant_type)
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Unit Type</label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full appearance-none rounded-xl border-none bg-gray-50 p-3 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                            value={formData.unit_type}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const variantType = val === 'Pieces (Pcs)' ? 'Sold by Piece Count' : '';
                                                                setFormData({
                                                                    ...formData,
                                                                    unit_type: val,
                                                                    variant_type: variantType,
                                                                    variant_list: updateAllVariants(formData.base_price, val, variantType)
                                                                });
                                                            }}
                                                        >
                                                            {Object.values(UNIT_TYPES).map(u => <option key={u.label}>{u.label}</option>)}
                                                        </select>
                                                        <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Description</label>
                                                <textarea
                                                    rows="1"
                                                    placeholder="Optional details..."
                                                    className="w-full rounded-xl border-none bg-gray-50 p-3 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Variant Pricing */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-1 rounded-full bg-purple-600"></div>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Variant Logic</h3>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer scale-90">
                                                <span className="text-[9px] font-black text-gray-400 uppercase">Custom</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.custom_variant_allowed}
                                                        onChange={e => setFormData({ ...formData, custom_variant_allowed: e.target.checked })}
                                                    />
                                                    <div className="h-4 w-8 rounded-full bg-gray-200 peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Quick Select Variants */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {getAvailableVariants().map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() => toggleVariant(v)}
                                                        className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase transition-all ${formData.variant_list.some(v_item => v_item.label === v) ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Variant Price List */}
                                            <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50/30">
                                                <div className="max-h-[180px] overflow-y-auto no-scrollbar">
                                                    {formData.variant_list.length > 0 ? (
                                                        <div className="divide-y divide-gray-100">
                                                            {formData.variant_list.map((v, i) => (
                                                                <div key={i} className="flex items-center justify-between p-2">
                                                                    <span className="text-[10px] font-bold text-gray-600 truncate mr-2">{v.label}</span>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <div className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 ring-1 ring-gray-100">
                                                                            <span className="text-[9px] font-black text-gray-300">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                className="w-12 bg-transparent text-[10px] font-black text-blue-600 outline-none"
                                                                                value={v.price}
                                                                                onChange={e => {
                                                                                    const newList = [...formData.variant_list];
                                                                                    newList[i].price = e.target.value;
                                                                                    setFormData({ ...formData, variant_list: newList });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <button type="button" onClick={() => toggleVariant(v.label)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                                            <TrashIcon className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center opacity-30">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">No variants active</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Category Form */
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-1 rounded-full bg-orange-600"></div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Details</h3>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Category Name</label>
                                        <input
                                            required
                                            placeholder="e.g. GHEE"
                                            className="w-full rounded-xl border-none bg-gray-50 p-4 text-xs font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                                            value={categoryName}
                                            onChange={e => setCategoryName(e.target.value)}
                                        />
                                    </div>
                                    <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-start gap-3">
                                        <InformationCircleIcon className="h-5 w-5 text-orange-600 shrink-0" />
                                        <p className="text-[9px] font-bold text-orange-800 uppercase tracking-tight leading-relaxed">
                                            Categories help organize your products in the POS terminal. Once created, you can assign products to this category in the Products tab.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-gray-50 flex gap-3 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-xl border border-gray-100 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] rounded-xl bg-blue-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    {activeTab === 'products' ? (editingProduct ? 'SYNC UPDATES' : 'CREATE PRODUCT') : (editingCategory ? 'UPDATE CATEGORY' : 'CREATE CATEGORY')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
            `}</style>
        </div>
    );
}

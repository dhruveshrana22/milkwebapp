'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from "@/context/DataContext";
import {
    PlusIcon,
    TrashIcon,
    ShoppingCartIcon,
    CubeIcon,
    CheckBadgeIcon,
    XMarkIcon,
    ClockIcon,
    CreditCardIcon,
    BanknotesIcon,
    CalendarIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    ArchiveBoxIcon,
    FolderPlusIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    PencilIcon
} from "@heroicons/react/24/outline";

const UNIT_TYPES = {
    LITRE: { label: 'Litre (L)', variants: ['100 mL', '200 mL', '250 mL', '500 mL', '750 mL', '1 L'] },
    KILOGRAM: { label: 'Kilogram (Kg)', variants: ['100 g', '200 g', '250 g', '500 g', '750 g', '1 Kg'] },
    PIECES: { label: 'Pieces (Pcs)', variants: [], variants_weight: ['100 g', '200 g', '250 g', '500 g', '750 g', '1 Kg'] }
};

export default function POSSales() {
    const { customers, products, categories, addBill, bills, addProduct, addCategory } = useData();
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [cart, setCart] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const [catSearch, setCatSearch] = useState('');
    const [paymentMode, setPaymentMode] = useState('Online');
    const [customPrice, setCustomPrice] = useState('');

    // Unified Modal State (from Master Page)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        sale_price: '',
        unit_type: 'Litre (L)',
        base_price: '',
        variant_type: '',
        variant_list: [],
        custom_variant_allowed: true,
        description: ''
    });
    const [categoryName, setCategoryName] = useState('');
    const [isNewCatDropdownOpen, setIsNewCatDropdownOpen] = useState(false);
    const [newCatSearch, setNewCatSearch] = useState('');

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            sale_price: '',
            unit_type: 'Litre (L)',
            base_price: '',
            variant_type: '',
            variant_list: [],
            custom_variant_allowed: true,
            description: ''
        });
        setCategoryName('');
    };

    const handleOpenModal = (tab = 'products') => {
        setActiveTab(tab);
        resetForm();
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
        if (unit === 'ml' || unit === 'g') return (value / 1000) * base;
        else if (unit === 'l' || unit === 'kg') return value * base;
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

    const handleManagementSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'products') {
            addProduct(formData);
        } else {
            addCategory({ name: categoryName });
        }
        setIsModalOpen(false);
        resetForm();
    };

    // Searchable Customer Dropdown State
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    const getCalculatedVariant = (price, product) => {
        if (!price || !product?.base_price) return 'Custom Amount';
        const base = parseFloat(product.base_price);
        const p = parseFloat(price);
        if (isNaN(base) || isNaN(p) || base === 0) return 'Custom Amount';

        const ratio = p / base;
        const unitType = product.unit_type?.toLowerCase() || '';

        if (unitType.includes('litre') || unitType.includes('(l)')) {
            if (ratio >= 1) return `${ratio.toFixed(3).replace(/\.?0+$/, '')} L`;
            return `${Math.round(ratio * 1000)} mL`;
        }
        if (unitType.includes('kilogram') || unitType.includes('(kg)')) {
            if (ratio >= 1) return `${ratio.toFixed(3).replace(/\.?0+$/, '')} Kg`;
            return `${Math.round(ratio * 1000)} g`;
        }
        return 'Custom Amount';
    };

    // Filtered Products
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);

    // Stats Calculation
    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayBills = bills.filter(b => b.date === todayStr);
        const onlineBills = todayBills.filter(b => b.paymentMode === 'Online');
        const cashBills = todayBills.filter(b => b.paymentMode === 'Cash');

        return {
            today: todayBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0),
            online: onlineBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0),
            cash: cashBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0)
        };
    }, [bills]);

    // Totals
    const grandTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

    // Variant Selection State
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [activeProduct, setActiveProduct] = useState(null);

    const handleProductClick = (product) => {
        setCustomPrice('');
        if (product.variant_list && product.variant_list.length > 0) {
            setActiveProduct(product);
            setShowVariantModal(true);
        } else {
            addToCart(product, product.sale_price, product.unit_type || 'Unit');
        }
    };

    const addToCart = (product, price, variantLabel) => {
        const itemIdentifier = `${product.id}-${variantLabel}`;
        const existing = cart.find(i => i.identifier === itemIdentifier);

        if (existing) {
            setCart(cart.map(i => i.identifier === itemIdentifier ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, {
                identifier: itemIdentifier,
                productId: product.id,
                name: product.name,
                variantLabel: variantLabel,
                price: parseFloat(price) || 0,
                quantity: 1,
                unit: variantLabel
            }]);
        }
        setShowVariantModal(false);
    };

    const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Cart is empty!');

        const billData = {
            customerId: selectedCustomerId || 'Walk-in',
            customerName: customers.find(c => c.id === selectedCustomerId)?.name || 'Walk-in Customer',
            items: cart.map(item => ({
                ...item,
                type: 'product'
            })),
            total: grandTotal,
            date,
            paymentMode
        };

        addBill(billData);
        setCart([]);
        setSelectedCustomerId('');
        setPaymentMode('Cash');
        alert('Bill saved successfully!');
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Back Button Handling for Modals
    useEffect(() => {
        const handlePopState = () => {
            setIsModalOpen(false);
            setShowVariantModal(false);
            setIsMobileMenuOpen(false);
        };

        if (isModalOpen || showVariantModal || isMobileMenuOpen) {
            window.history.pushState({ modalOpen: true }, "");
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isModalOpen, showVariantModal, isMobileMenuOpen]);

    // Helper to close modals manually while cleaning history
    const closeAllModals = () => {
        if (isModalOpen || showVariantModal || isMobileMenuOpen) {
            if (window.history.state?.modalOpen) {
                window.history.back();
            } else {
                setIsModalOpen(false);
                setShowVariantModal(false);
                setIsMobileMenuOpen(false);
            }
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-3 space-y-4">
            {/* Header & Stats Section */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
                <div className="xl:col-span-1">
                    <h1 className="text-3xl font-black text-gray-900 leading-none">Sales POS</h1>
                    <p className="text-[14px] text-gray-400 font-bold uppercase tracking-widest mt-1">Terminal Active</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 xl:col-span-4">
                    {[
                        { label: "Today's Total", value: stats.today, icon: ClockIcon, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Cash Sale", value: stats.cash, icon: BanknotesIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Online Sale", value: stats.online, icon: CreditCardIcon, color: "text-purple-600", bg: "bg-purple-50" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-3 rounded-2xl shadow-sm ring-1 ring-gray-100 flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-black text-gray-400 uppercase tracking-tight truncate">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900 leading-none">₹{stat.value.toFixed(0)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
                {/* Product Selection Area (Modal on mobile, Sidebar on desktop) */}
                <div className={`lg:col-span-8 ${isMobileMenuOpen ? 'fixed inset-0 z-[110] bg-gray-50 flex flex-col p-4 pb-24' : 'hidden lg:block'} space-y-4`}>
                    {/* Products Header for Mobile */}
                    {isMobileMenuOpen && (
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-black uppercase text-gray-900">Select Products</h2>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full rounded-xl border-none bg-white p-3 pl-10 text-[16px] font-bold text-gray-900 shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Searchable Category Dropdown */}
                        <div className="relative w-full sm:w-64">
                            <button
                                type="button"
                                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                                className="w-full h-full flex items-center justify-between rounded-xl border-none bg-white p-3 text-gray-900 text-[16px] font-bold shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <CubeIcon className="h-4 w-4 text-orange-500" />
                                    <span className="truncate">
                                        {categoryFilter === 'All' ? 'All Categories' : categoryFilter}
                                    </span>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''} shrink-0`} />
                            </button>

                            {isCatDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-[125]" onClick={() => setIsCatDropdownOpen(false)}></div>
                                    <div className="absolute z-[130] mt-2 w-full rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <div className="relative mb-2">
                                            <input
                                                type="text"
                                                placeholder="Search category..."
                                                className="w-full rounded-xl border-none bg-gray-50 p-2.5 pl-9 text-[12px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-orange-500/20"
                                                value={catSearch}
                                                onChange={e => setCatSearch(e.target.value)}
                                                autoFocus
                                            />
                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-0.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCategoryFilter('All');
                                                    setIsCatDropdownOpen(false);
                                                    setCatSearch('');
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-black uppercase transition-colors ${categoryFilter === 'All' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                All Categories
                                            </button>
                                            {categories
                                                .filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
                                                .map(c => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCategoryFilter(c.name);
                                                            setIsCatDropdownOpen(false);
                                                            setCatSearch('');
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-black uppercase transition-colors ${categoryFilter === c.name ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleOpenModal('products')}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-[14px] font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all shrink-0 uppercase tracking-[0.1em]"
                            >
                                <ArchiveBoxIcon className="h-4 w-4" />
                                <span>NEW PRODUCT</span>
                            </button>
                            <button
                                onClick={() => handleOpenModal('categories')}
                                className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-[14px] font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all shrink-0 uppercase tracking-[0.1em]"
                            >
                                <FolderPlusIcon className="h-4 w-4" />
                                <span>NEW CATEGORY</span>
                            </button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 pb-20 lg:pb-0">
                            {filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        handleProductClick(p);
                                        // Auto close menu on mobile after selection if it's a direct add
                                        if (!(p.variant_list && p.variant_list.length > 0)) {
                                            // setIsMobileMenuOpen(false); // Optional: keep open for multiple items
                                        }
                                    }}
                                    className="relative flex flex-col items-start rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 hover:ring-blue-500 hover:shadow-md transition-all group overflow-hidden text-left"
                                >
                                    <span className="relative z-10 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[12px] font-black text-blue-600 uppercase tracking-tight mb-1">
                                        {p.unit_type?.split(' ')[0] || 'Unit'}
                                    </span>
                                    <p className="relative z-10 font-bold text-gray-900 uppercase text-[14px] line-clamp-2 leading-tight group-hover:text-blue-600 h-8">
                                        {p.name}
                                    </p>
                                    <div className="mt-2 flex w-full items-center justify-between">
                                        <p className="text-[16px] font-black text-blue-600">₹{p.sale_price}</p>
                                        <div className="rounded-lg bg-blue-50 p-1 group-hover:bg-blue-600 transition-colors">
                                            <PlusIcon className="h-3 w-3 text-blue-600 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Menu Close Button */}
                    {isMobileMenuOpen && (
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[130] flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-900 shadow-2xl ring-1 ring-gray-200 active:scale-90 transition-all group lg:hidden"
                        >
                            <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    )}
                </div>

                {/* Checkout/Cart Area */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-4 rounded-2xl text-gray-900 shadow-xl shadow-blue-100/50 ring-1 ring-gray-100 flex flex-col h-[600px] lg:h-[700px]">
                        <div className="mb-3 flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                    <ShoppingCartIcon className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none uppercase">Checkout</h2>
                            </div>
                            <span className="text-[14px] font-black uppercase text-gray-400">{cart.length} items</span>
                        </div>

                        {/* Customer & Date */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="text-[13px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Customer</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                                        className="w-full flex items-center justify-between rounded-xl border-none bg-gray-50 p-2 text-gray-900 text-[15px] font-bold outline-none focus:ring-1 focus:ring-blue-500 transition-all text-left"
                                    >
                                        <span className="truncate">
                                            {selectedCustomerId ? (customers.find(c => c.id === selectedCustomerId)?.name || 'Walk-in') : 'Walk-in'}
                                        </span>
                                        <ChevronDownIcon className={`h-3 w-3 text-gray-400 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''} shrink-0`} />
                                    </button>

                                    {isCustomerDropdownOpen && (
                                        <div className="absolute z-[110] mt-1 w-[180px] sm:w-[220px] left-0 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                                            <div className="relative mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search customer..."
                                                    className="w-full rounded-lg border-none bg-gray-50 p-1.5 pl-7 text-[14px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-blue-500/20"
                                                    value={customerSearch}
                                                    onChange={e => setCustomerSearch(e.target.value)}
                                                    autoFocus
                                                />
                                                <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                            <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCustomerId('');
                                                        setIsCustomerDropdownOpen(false);
                                                        setCustomerSearch('');
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-colors ${!selectedCustomerId ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                                                >
                                                    Walk-in Customer
                                                </button>
                                                {customers
                                                    .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch))
                                                    .map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCustomerId(c.id);
                                                                setIsCustomerDropdownOpen(false);
                                                                setCustomerSearch('');
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-colors ${selectedCustomerId === c.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                                        >
                                                            {c.name}
                                                        </button>
                                                    ))}
                                                {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch)).length === 0 && (
                                                    <p className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase">Not found</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-[13px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-xl border-none bg-gray-50 p-2 text-gray-900 text-[15px] font-bold outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar mb-3">
                            {cart.map((item, idx) => (
                                <div key={item.identifier} className="group relative flex items-center justify-between gap-2 bg-gray-50/50 p-2.5 rounded-xl ring-1 ring-gray-100 transition-all">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-[15px] uppercase truncate text-gray-800 leading-tight">{item.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[12px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded leading-none">{item.variantLabel}</span>
                                            <span className="text-[12px] font-bold text-gray-400">@ ₹{item.price}</span>
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <div className="flex items-center rounded-xl bg-white p-1.5 ring-1 ring-gray-200 shadow-sm min-w-[110px]">
                                                <button
                                                    onClick={() => {
                                                        const newCart = [...cart];
                                                        newCart[idx].quantity = Math.max(0, (parseFloat(newCart[idx].quantity) || 0) - 1);
                                                        setCart(newCart);
                                                    }}
                                                    className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-xl font-medium"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="w-14 bg-transparent text-center text-lg font-black text-gray-900 outline-none"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const newCart = [...cart];
                                                        newCart[idx].quantity = parseFloat(e.target.value) || 0;
                                                        setCart(newCart);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newCart = [...cart];
                                                        newCart[idx].quantity = (parseFloat(newCart[idx].quantity) || 0) + 1;
                                                        setCart(newCart);
                                                    }}
                                                    className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-xl font-medium"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between self-stretch">
                                        <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500 transition-all">
                                            <TrashIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <p className="font-black text-[16px] text-gray-900 leading-none">₹{(item.price * item.quantity).toFixed(0)}</p>
                                    </div>
                                </div>
                            ))}

                            {cart.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-10 py-10 text-center">
                                    <ShoppingCartIcon className="h-10 w-10 mb-2 stroke-1" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Cart is Empty</p>
                                </div>
                            )}
                        </div>

                        {/* Footer & Payment */}
                        <div className="space-y-3 pt-3 border-t border-gray-50 shrink-0">
                            <div className="flex gap-2">
                                {['Cash', 'Online'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentMode(mode)}
                                        className={`flex-1 flex flex-row items-center justify-center py-2 rounded-xl transition-all gap-1.5 border-2 ${paymentMode === mode
                                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-transparent text-gray-400 hover:bg-gray-50 font-bold'
                                            }`}
                                    >
                                        {mode === 'Cash' ? <BanknotesIcon className="h-3.5 w-3.5" /> : <CreditCardIcon className="h-3.5 w-3.5" />}
                                        <span className="text-[14px] font-black uppercase">{mode}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                                <div>
                                    <p className="text-[12px] font-black uppercase text-gray-400">Total Amount</p>
                                    <p className="text-3xl font-black text-gray-900 leading-none mt-1">₹{grandTotal.toFixed(0)}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {paymentMode}
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full rounded-2xl bg-blue-600 py-3.5 text-[15px] font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                <CheckBadgeIcon className="h-4 w-4" />
                                FINALIZE & SAVE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed bottom-10 right-6 z-[100] flex items-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-base font-black text-white shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
            >
                <PlusIcon className="h-5 w-5" />
                <span>ADD ITEMS</span>
            </button>

            {/* Variant Selection Modal */}
            {showVariantModal && activeProduct && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 overflow-hidden text-left">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={closeAllModals}></div>
                    <div className="relative w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-full rounded-[2rem] bg-white p-6 shadow-3xl">
                            <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
                                <div>
                                    <p className="text-[13px] font-black uppercase tracking-widest text-blue-600 leading-none">Variant Select</p>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase mt-1 leading-tight">{activeProduct.name}</h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {activeProduct.variant_list?.map((variant, i) => (
                                    <button
                                        key={i}
                                        onClick={() => addToCart(activeProduct, variant.price, variant.label)}
                                        className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-4 text-gray-900 ring-1 ring-gray-100 transition-all active:scale-95 hover:bg-blue-50"
                                    >
                                        <span className="text-[14px] font-black uppercase text-gray-400 mb-0.5">{variant.label}</span>
                                        <span className="text-[12px] font-black tracking-tight">₹{variant.price}</span>
                                    </button>
                                ))}
                            </div>

                            {activeProduct.custom_variant_allowed && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[9px] font-black text-gray-400 uppercase">Custom Amount</p>
                                        <p className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                                            {getCalculatedVariant(customPrice, activeProduct)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                className="w-full rounded-xl bg-gray-50 py-2.5 pl-6 pr-3 text-[13px] font-black text-gray-900 outline-none focus:ring-1 focus:ring-blue-500/20"
                                                value={customPrice}
                                                onChange={(e) => setCustomPrice(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (customPrice) {
                                                    const variantLabel = getCalculatedVariant(customPrice, activeProduct);
                                                    addToCart(activeProduct, customPrice, variantLabel);
                                                    setCustomPrice('');
                                                }
                                            }}
                                            className="rounded-xl bg-gray-900 px-4 text-[11px] font-black text-white hover:bg-black transition-all"
                                        >
                                            ADD
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Floating Close Button */}
                        <button
                            onClick={closeAllModals}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[130] flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-900 shadow-3xl hover:bg-gray-50 active:scale-90 transition-all ring-1 ring-gray-100 group"
                        >
                            <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            )}

            {/* Unified Management Modal (from Master Page) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeAllModals}></div>
                    <div className="relative w-full max-w-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-full rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                            {/* Modal Header */}
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase">
                                        {activeTab === 'products' ? 'New Product' : 'New Category'}
                                    </h2>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Management Console</p>
                                </div>
                            </div>
                            {/* ... body content ... */}
                            <form onSubmit={handleManagementSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                {/* rest of form code remains same as before but encapsulated here */}
                                {activeTab === 'products' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Section 1: Basic Info */}
                                        <div className="space-y-3 text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-1 rounded-full bg-blue-600"></div>
                                                <h3 className="text-[14px] font-black uppercase tracking-widest text-gray-400">Basic Details</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-[14px] font-bold text-gray-400 uppercase mb-1 ml-1">Product Name</label>
                                                    <input
                                                        required
                                                        placeholder="e.g. Buffalo Milk"
                                                        className="w-full rounded-xl border-none bg-gray-50 p-3 text-[16px] font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[14px] font-bold text-gray-400 uppercase mb-1 ml-1">Category</label>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsNewCatDropdownOpen(!isNewCatDropdownOpen)}
                                                            className="w-full flex items-center justify-between rounded-xl border-none bg-gray-50 p-3 text-[16px] font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                        >
                                                            <span className={formData.category ? "text-gray-900" : "text-gray-400"}>
                                                                {formData.category || 'Select Category'}
                                                            </span>
                                                            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isNewCatDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {isNewCatDropdownOpen && (
                                                            <>
                                                                <div className="fixed inset-0 z-[160]" onClick={() => setIsNewCatDropdownOpen(false)}></div>
                                                                <div className="absolute z-[170] mt-2 w-full rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                                    <div className="relative mb-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search category..."
                                                                            className="w-full rounded-lg border-none bg-gray-50 p-2 pl-8 text-[11px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-blue-500/20"
                                                                            value={newCatSearch}
                                                                            onChange={e => setNewCatSearch(e.target.value)}
                                                                            autoFocus
                                                                        />
                                                                        <ArrowPathIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                                    </div>
                                                                    <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-0.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, category: '' });
                                                                                setIsNewCatDropdownOpen(false);
                                                                                setNewCatSearch('');
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase"
                                                                        >
                                                                            None / Select Category
                                                                        </button>
                                                                        {categories
                                                                            .filter(c => c.name.toLowerCase().includes(newCatSearch.toLowerCase()))
                                                                            .map(cat => (
                                                                                <button
                                                                                    key={cat.id}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setFormData({ ...formData, category: cat.name });
                                                                                        setIsNewCatDropdownOpen(false);
                                                                                        setNewCatSearch('');
                                                                                    }}
                                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-black uppercase transition-colors ${formData.category === cat.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                                                                >
                                                                                    {cat.name}
                                                                                </button>
                                                                            ))}
                                                                        {categories.filter(c => c.name.toLowerCase().includes(newCatSearch.toLowerCase())).length === 0 && (
                                                                            <p className="p-3 text-center text-[10px] font-bold text-gray-400 uppercase">No matches found</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[14px] font-bold text-gray-400 uppercase mb-1 ml-1">Sale Price (₹)</label>
                                                        <input
                                                            required
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-full rounded-xl border-none bg-gray-50 p-3 text-[16px] font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                                                        <label className="block text-[14px] font-bold text-gray-400 uppercase mb-1 ml-1">Unit Type</label>
                                                        <div className="relative">
                                                            <select
                                                                className="w-full appearance-none rounded-xl border-none bg-gray-50 p-3 text-[16px] font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                                                                {Object.values(UNIT_TYPES).map(u => <option key={u.label} value={u.label}>{u.label}</option>)}
                                                            </select>
                                                            <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[14px] font-bold text-gray-400 uppercase mb-1 ml-1">Description</label>
                                                    <textarea
                                                        rows="1"
                                                        placeholder="Optional details..."
                                                        className="w-full rounded-xl border-none bg-gray-50 p-3 text-[16px] font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
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
                                                    <h3 className="text-[14px] font-black uppercase tracking-widest text-gray-400">Variant Logic</h3>
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer scale-90">
                                                    <span className="text-[13px] font-black text-gray-400 uppercase">Custom</span>
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
                                                            className={`rounded-lg px-2.5 py-1 text-[13px] font-black uppercase transition-all ${formData.variant_list.some(v_item => v_item.label === v) ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Variant Price List */}
                                                <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50/30">
                                                    <div className="max-h-[180px] overflow-y-auto custom-scrollbar">
                                                        {formData.variant_list.length > 0 ? (
                                                            <div className="divide-y divide-gray-100">
                                                                {formData.variant_list.map((v, i) => (
                                                                    <div key={i} className="flex items-center justify-between p-2">
                                                                        <span className="text-[14px] font-bold text-gray-600 truncate mr-2">{v.label}</span>
                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                            <div className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 ring-1 ring-gray-100">
                                                                                <span className="text-[13px] font-black text-gray-300">₹</span>
                                                                                <input
                                                                                    type="number"
                                                                                    className="w-12 bg-transparent text-[14px] font-black text-blue-600 outline-none"
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
                                                                <p className="text-[13px] font-black uppercase tracking-widest text-gray-400">No variants active</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Category Form */
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-1 rounded-full bg-orange-600"></div>
                                            <h3 className="text-[14px] font-black uppercase tracking-widest text-gray-400">Category Details</h3>
                                        </div>
                                        <div>
                                            <label className="block text-[14px] font-bold text-gray-400 uppercase mb-1 ml-1">Category Name</label>
                                            <input
                                                required
                                                placeholder="e.g. GHEE"
                                                className="w-full rounded-xl border-none bg-gray-50 p-4 text-[16px] font-bold text-gray-900 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                                                value={categoryName}
                                                onChange={e => setCategoryName(e.target.value)}
                                            />
                                        </div>
                                        <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-start gap-3">
                                            <InformationCircleIcon className="h-5 w-5 text-orange-600 shrink-0" />
                                            <p className="text-[13px] font-bold text-orange-800 uppercase tracking-tight leading-relaxed">
                                                Categories help organize your products in the POS terminal. Once created, you can assign products to this category in the Products tab.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Modal Footer */}
                                <div className="pt-4 border-t border-gray-50 flex gap-3 sticky bottom-0 bg-white">
                                    <button
                                        type="button"
                                        onClick={closeAllModals}
                                        className="flex-1 rounded-xl border border-gray-100 py-3 text-[15px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] rounded-xl bg-blue-600 py-3 text-[15px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
                                    >
                                        {activeTab === 'products' ? 'REGISTER PRODUCT' : 'CREATE CATEGORY'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* Floating Close Button */}
                        <button
                            onClick={closeAllModals}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[160] flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-900 shadow-3xl hover:bg-gray-50 active:scale-90 transition-all ring-1 ring-gray-100 group"
                        >
                            <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

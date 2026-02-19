'use client';

import { useState, useMemo } from 'react';
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
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function POSSales() {
    const { customers, products, categories, addBill, bills } = useData();
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [cart, setCart] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [unitFilter, setUnitFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [customPrice, setCustomPrice] = useState('');

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
            const matchesUnit = unitFilter === 'All' || p.unit_type?.includes(unitFilter);
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
            return matchesSearch && matchesUnit && matchesCategory;
        });
    }, [products, searchTerm, unitFilter, categoryFilter]);

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

    return (
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-3 space-y-4">
            {/* Header & Stats Section */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
                <div className="xl:col-span-1">
                    <h1 className="text-xl font-black text-gray-900 leading-none">Sales POS</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Terminal Active</p>
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
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight truncate">{stat.label}</p>
                                <p className="text-sm font-black text-gray-900 leading-none">₹{stat.value.toFixed(0)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
                {/* Product Selection Area (Modal on mobile, Sidebar on desktop) */}
                <div className={`lg:col-span-8 ${isMobileMenuOpen ? 'fixed inset-0 z-[110] bg-gray-50 flex flex-col p-4' : 'hidden lg:block'} space-y-4`}>
                    {/* Products Header for Mobile */}
                    {isMobileMenuOpen && (
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-black uppercase text-gray-900">Select Products</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white rounded-xl shadow-sm">
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full rounded-xl border-none bg-white p-2.5 pl-9 text-xs font-bold text-gray-900 shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <ShoppingCartIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                                {['All', 'Litre', 'Kg', 'Pcs'].map(unit => (
                                    <button
                                        key={unit}
                                        onClick={() => setUnitFilter(unit)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${unitFilter === unit ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white text-gray-400 ring-1 ring-gray-100 hover:bg-gray-50'}`}
                                    >
                                        {unit}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 border-t border-gray-50 pt-2">
                            <button
                                onClick={() => setCategoryFilter('All')}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${categoryFilter === 'All' ? 'bg-orange-600 text-white shadow-md shadow-orange-100' : 'bg-white text-gray-400 ring-1 ring-gray-100 hover:bg-gray-50'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoryFilter(cat.name)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${categoryFilter === cat.name ? 'bg-orange-600 text-white shadow-md shadow-orange-100' : 'bg-white text-gray-400 ring-1 ring-gray-100 hover:bg-gray-50'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
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
                                    <span className="relative z-10 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[8px] font-black text-blue-600 uppercase tracking-tight mb-1">
                                        {p.unit_type?.split(' ')[0] || 'Unit'}
                                    </span>
                                    <p className="relative z-10 font-bold text-gray-900 uppercase text-[10px] line-clamp-2 leading-tight group-hover:text-blue-600 h-7">
                                        {p.name}
                                    </p>
                                    <div className="mt-2 flex w-full items-center justify-between">
                                        <p className="text-xs font-black text-blue-600">₹{p.sale_price}</p>
                                        <div className="rounded-lg bg-blue-50 p-1 group-hover:bg-blue-600 transition-colors">
                                            <PlusIcon className="h-3 w-3 text-blue-600 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Checkout/Cart Area */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-4 rounded-2xl text-gray-900 shadow-xl shadow-blue-100/50 ring-1 ring-gray-100 flex flex-col h-[600px] lg:h-[700px]">
                        <div className="mb-3 flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                    <ShoppingCartIcon className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-base font-black tracking-tight leading-none uppercase">Checkout</h2>
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-400">{cart.length} items</span>
                        </div>

                        {/* Customer & Date */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Customer</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                                        className="w-full flex items-center justify-between rounded-xl border-none bg-gray-50 p-2 text-gray-900 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 transition-all text-left"
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
                                                    className="w-full rounded-lg border-none bg-gray-50 p-1.5 pl-7 text-[9px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-blue-500/20"
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
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-colors ${!selectedCustomerId ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
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
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-colors ${selectedCustomerId === c.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                                        >
                                                            {c.name}
                                                        </button>
                                                    ))}
                                                {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch)).length === 0 && (
                                                    <p className="p-3 text-center text-[8px] font-bold text-gray-400 uppercase">Not found</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-xl border-none bg-gray-50 p-2 text-gray-900 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
                                        <p className="font-black text-[10px] uppercase truncate text-gray-800 leading-tight">{item.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded leading-none">{item.variantLabel}</span>
                                            <span className="text-[8px] font-bold text-gray-400">@ ₹{item.price}</span>
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <div className="flex items-center rounded-lg bg-white p-0.5 ring-1 ring-gray-200">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="w-10 bg-transparent text-center text-[10px] font-black text-gray-900 outline-none"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const newCart = [...cart];
                                                        newCart[idx].quantity = parseFloat(e.target.value) || 0;
                                                        setCart(newCart);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between self-stretch">
                                        <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500 transition-all">
                                            <TrashIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <p className="font-black text-[12px] text-gray-900 leading-none">₹{(item.price * item.quantity).toFixed(0)}</p>
                                    </div>
                                </div>
                            ))}

                            {cart.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-10 py-10 text-center">
                                    <ShoppingCartIcon className="h-10 w-10 mb-2 stroke-1" />
                                    <p className="text-[8px] font-black uppercase tracking-widest">Cart is Empty</p>
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
                                        <span className="text-[9px] font-black uppercase">{mode}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-gray-400">Total Amount</p>
                                    <p className="text-xl font-black text-gray-900 leading-none mt-1">₹{grandTotal.toFixed(0)}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {paymentMode}
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full rounded-2xl bg-blue-600 py-3.5 text-[10px] font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
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
                className="lg:hidden fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-xs font-black text-white shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
            >
                <PlusIcon className="h-5 w-5" />
                <span>ADD ITEMS</span>
            </button>

            {/* Variant Selection Modal */}
            {showVariantModal && activeProduct && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowVariantModal(false)}></div>
                    <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-3xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 leading-none">Variant Select</p>
                                <h2 className="text-lg font-black text-gray-900 uppercase mt-1 leading-tight">{activeProduct.name}</h2>
                            </div>
                            <button onClick={() => setShowVariantModal(false)} className="rounded-xl bg-gray-50 p-2 text-gray-400 transition-all">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
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
                                            className="w-full rounded-xl bg-gray-50 py-2.5 pl-6 pr-3 text-xs font-black text-gray-900 outline-none focus:ring-1 focus:ring-blue-500/20"
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
                                        className="rounded-xl bg-gray-900 px-4 text-[10px] font-black text-white hover:bg-black transition-all"
                                    >
                                        ADD
                                    </button>
                                </div>
                            </div>
                        )}
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

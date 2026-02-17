'use client';

import { useState, useMemo } from 'react';
import { useData } from "@/context/DataContext";
import {
    PlusIcon,
    TrashIcon,
    ShoppingCartIcon,
    UserPlusIcon,
    BeakerIcon,
    CubeIcon,
    CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function POSSales() {
    const { customers, milkTypes, products, addBill } = useData();
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [cart, setCart] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Totals
    const grandTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

    const addToCart = (item, type) => {
        const existing = cart.find(i => i.id === item.id && i.type === type);
        if (existing) {
            setCart(cart.map(i => i.id === item.id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, {
                id: item.id,
                name: item.name,
                type,
                price: item.price,
                quantity: 1,
                unit: item.unit,
                fat: item.fat || null
            }]);
        }
    };

    const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Cart is empty!');

        addBill({
            customerId: selectedCustomerId || 'Walk-in',
            customerName: customers.find(c => c.id === selectedCustomerId)?.name || 'Walk-in Customer',
            items: cart,
            total: grandTotal,
            date
        });

        setCart([]);
        setSelectedCustomerId('');
        alert('Bill saved successfully!');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Selection Area */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">POS Sales Entry</h1>
                    <p className="text-gray-500">Fast daily billing for milk and products.</p>
                </div>

                {/* Customer & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Select Customer (Optional)</label>
                        <select
                            className="w-full rounded-xl border-gray-100 bg-gray-50 p-3 text-black text-sm outline-none focus:bg-white"
                            value={selectedCustomerId}
                            onChange={e => setSelectedCustomerId(e.target.value)}
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Billing Date</label>
                        <input
                            type="date"
                            className="w-full rounded-xl border-gray-100 bg-gray-50 p-3 text-black text-sm outline-none focus:bg-white"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Milk Variants */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <BeakerIcon className="h-4 w-4" /> Milk Variants
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {milkTypes.map(m => (
                            <button
                                key={m.id}
                                onClick={() => addToCart(m, 'milk')}
                                className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:ring-blue-400 hover:shadow-md transition-all active:scale-95 group"
                            >
                                <p className="text-xs font-bold text-gray-400 group-hover:text-blue-500">{m.fat}% Fat</p>
                                <p className="font-black text-gray-900 uppercase">{m.name}</p>
                                <p className="mt-2 text-lg font-black text-blue-600">₹{m.price}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Other Products */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <CubeIcon className="h-4 w-4" /> Other Products
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {products.map(p => (
                            <button
                                key={p.id}
                                onClick={() => addToCart(p, 'product')}
                                className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:ring-green-400 hover:shadow-md transition-all active:scale-95 group"
                            >
                                <p className="text-[10px] font-bold text-gray-400 uppercase group-hover:text-green-600">{p.unit}</p>
                                <p className="font-black text-gray-900 uppercase truncate w-full">{p.name}</p>
                                <p className="mt-2 text-lg font-black text-green-600">₹{p.price}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Area */}
            <div className="lg:col-span-1">
                <div className="sticky top-8 rounded-3xl bg-slate-900 p-6 text-white shadow-2xl flex flex-col h-[600px]">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <ShoppingCartIcon className="h-6 w-6 text-blue-400" />
                            <h2 className="text-xl font-bold">New Bill</h2>
                        </div>
                        <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold">{cart.length} Items</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {cart.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="flex items-center justify-between gap-3 group">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm uppercase truncate">{item.name} {item.fat ? `(${item.fat}%)` : ''}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-16 rounded-md bg-slate-800 border-none text-xs font-bold text-white px-2 py-1 outline-none ring-1 ring-slate-700 focus:ring-blue-500"
                                            value={item.quantity}
                                            onChange={e => {
                                                const newCart = [...cart];
                                                newCart[idx].quantity = parseFloat(e.target.value) || 0;
                                                setCart(newCart);
                                            }}
                                        />
                                        <span className="text-[10px] text-slate-400">{item.unit} × ₹{item.price}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-blue-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(idx)} className="text-slate-600 hover:text-red-500 transition-colors">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                                <ShoppingCartIcon className="h-12 w-12 mb-2" />
                                <p className="text-sm font-bold">Cart is Empty</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 border-t border-slate-800 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">Grand Total</span>
                            <span className="text-3xl font-black text-white">₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckBadgeIcon className="h-5 w-5" />
                            FINALIZE BILL
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
        </div>
    );
}

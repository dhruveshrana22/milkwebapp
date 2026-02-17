'use client';

import { useState, useMemo, use } from 'react';
import { useData } from "@/context/DataContext";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    startOfWeek,
    endOfWeek,
    parseISO
} from "date-fns";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    ShoppingBagIcon,
    TrashIcon,
    XMarkIcon,
    CurrencyRupeeIcon,
    BeakerIcon,
    CubeIcon,
    TagIcon,
    PlusIcon,
    CheckBadgeIcon,
    CalculatorIcon
} from "@heroicons/react/24/outline";
import Link from 'next/link';

export default function CustomerDetail({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const { customers, orders, bills, products, milkTypes, addOrder, updateOrder, deleteOrder, addBill } = useData();

    const customer = customers.find(c => c.id === id);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Selection/Edit State (Milk Logs)
    const [selectedDate, setSelectedDate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ liters: '', grams: '0' });

    // Product Transaction State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productFormData, setProductFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        productId: '',
        price: '',
        quantity: '1'
    });

    // Customer specific orders (Daily Milk)
    const customerOrders = useMemo(() => {
        return orders.filter(o => o.customerId === id);
    }, [orders, id]);

    // Customer specific bills (POS Sales)
    const customerBills = useMemo(() => {
        return bills.filter(b => b.customerId === id);
    }, [bills, id]);

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    // Get current milk price for this customer
    const currentMilkPrice = useMemo(() => {
        const linkedMilk = customer?.linkedProducts?.find(p => p.type === 'milk');
        if (linkedMilk) {
            const masterMilk = milkTypes.find(m => m.id === linkedMilk.id);
            return masterMilk ? parseFloat(masterMilk.price) : 0;
        }
        return milkTypes.length > 0 ? parseFloat(milkTypes[0].price) : 0;
    }, [customer, milkTypes]);

    // Financial calculations
    const monthlyStats = useMemo(() => {
        const monthStr = format(currentMonth, 'yyyy-MM');

        // Milk from daily logs (Quantity)
        const milkQty = customerOrders
            .filter(o => format(parseISO(o.date), 'yyyy-MM') === monthStr)
            .reduce((sum, o) => sum + (o.totalQty || 0), 0);

        // Calculate Milk Value (Qty * Price)
        const milkValue = milkQty * currentMilkPrice;

        // POS Sales total
        const posValue = customerBills
            .filter(b => format(parseISO(b.date), 'yyyy-MM') === monthStr)
            .reduce((sum, b) => sum + (b.total || 0), 0);

        const grandTotal = milkValue + posValue;

        return { milkQty, milkValue, posValue, grandTotal };
    }, [customerOrders, customerBills, currentMonth, currentMilkPrice]);

    const lifeTimeTotal = useMemo(() => {
        const posLifetime = customerBills.reduce((sum, b) => sum + (b.total || 0), 0);
        return posLifetime;
    }, [customerBills]);

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <XMarkIcon className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Customer not found</h2>
                <Link href="/customers" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to Customers
                </Link>
            </div>
        );
    }

    const handleDateClick = (date) => {
        const order = customerOrders.find(o => isSameDay(parseISO(o.date), date));
        setSelectedDate(date);
        if (order) {
            setEditData({ liters: order.liters, grams: order.grams, orderId: order.id });
        } else {
            setEditData({ liters: customer.defaultQty, grams: '0', orderId: null });
        }
        setIsEditModalOpen(true);
    };

    const handleSaveOrder = (e) => {
        e.preventDefault();
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        if (editData.orderId) {
            updateOrder(editData.orderId, {
                liters: editData.liters,
                grams: editData.grams
            });
        } else {
            addOrder({
                customerId: id,
                customerName: customer.name,
                date: dateStr,
                liters: editData.liters,
                grams: editData.grams
            });
        }
        setIsEditModalOpen(false);
    };

    const handleDeleteOrder = () => {
        if (editData.orderId) {
            deleteOrder(editData.orderId);
            setIsEditModalOpen(false);
        }
    };

    const handleProductSelect = (pid) => {
        const prod = products.find(p => p.id === pid);
        if (prod) {
            setProductFormData({
                ...productFormData,
                productId: pid,
                price: prod.price
            });
        }
    };

    const handleSaveProductSale = (e) => {
        e.preventDefault();
        const prod = products.find(p => p.id === productFormData.productId);
        if (!prod) return;

        const total = parseFloat(productFormData.price) * parseFloat(productFormData.quantity);

        addBill({
            customerId: customer.id,
            customerName: customer.name,
            date: productFormData.date,
            items: [{
                id: prod.id,
                productId: prod.id,
                name: prod.name,
                type: 'product',
                price: productFormData.price,
                quantity: productFormData.quantity,
                unit: prod.unit
            }],
            total: total
        });

        setIsProductModalOpen(false);
        setProductFormData({
            date: new Date().toISOString().split('T')[0],
            productId: '',
            price: '',
            quantity: '1'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <Link href="/customers" className="p-3 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 text-gray-400 hover:text-blue-600 transition-all active:scale-95">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{customer.name}</h1>
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <TagIcon className="h-4 w-4" />
                            <span>ID: {customer.id.slice(-6)}</span>
                            <span className="mx-1">•</span>
                            <span>{customer.address}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsProductModalOpen(true)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-tight shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        ADD ITEM
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats & Finance Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Lifetime Value Card */}
                    <div className="rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lifetime Purchase</p>
                        <p className="mt-2 text-4xl font-black tracking-tighter">₹{lifeTimeTotal.toFixed(0)}</p>
                        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400">
                            <CurrencyRupeeIcon className="h-4 w-4" />
                            Total Sales from Shop
                        </div>
                    </div>

                    {/* Monthly Analytics */}
                    <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-gray-100 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">{format(currentMonth, 'MMMM')} Bill Summary</h3>

                        <div className="space-y-4">
                            {/* Milk Qty & Price Row */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <BeakerIcon className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600">Daily Milk</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-blue-600">{monthlyStats.milkQty.toFixed(1)}L</p>
                                        <p className="text-[10px] font-bold text-gray-400">₹{monthlyStats.milkValue.toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* POS Items Row */}
                            <div className="flex items-center justify-between group pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <CubeIcon className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">Shop Items</span>
                                </div>
                                <span className="text-lg font-black text-emerald-600">₹{monthlyStats.posValue.toFixed(0)}</span>
                            </div>

                            {/* GRAND TOTAL ROW */}
                            <div className="pt-4 border-t-2 border-dashed border-gray-100">
                                <div className="flex items-center justify-center rounded-2xl p-4 text-black shadow-lg shadow-slate-100 animate-pulse-slow">
                                    {/* <div className="flex items-center gap-3">
                                        <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                                    </div> */}
                                    <span className="text-xl font-black tracking-tight">₹{monthlyStats.grandTotal.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 font-black">
                            <p className="text-[10px] uppercase text-gray-400 mb-1">Contact</p>
                            <p className="text-gray-900">{customer.mobile}</p>
                        </div>
                    </div>
                </div>

                {/* Main Activity Area */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Calendar Section */}
                    <div className="rounded-[40px] bg-white p-8 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <ShoppingBagIcon className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 text-gray-400 transition-all active:scale-90"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 text-gray-400 transition-all active:scale-90"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 bg-gray-50/50 rounded-3xl overflow-hidden border border-gray-50 p-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">{day}</div>
                            ))}
                            {calendarDays.map((day, idx) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const order = customerOrders.find(o => o.date === dateStr);
                                const dayBills = customerBills.filter(b => b.date === dateStr);
                                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                const today = isToday(day);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateClick(day)}
                                        className={`relative h-24 sm:h-28 bg-white p-2 transition-all hover:z-10 hover:shadow-xl hover:ring-2 hover:ring-blue-400 group rounded-2xl ${!isCurrentMonth ? 'bg-gray-50/50 opacity-30 shadow-none ring-0' : 'shadow-sm'}`}
                                        disabled={!isCurrentMonth}
                                    >
                                        <span className={`text-sm font-black ${today ? 'text-blue-600 bg-blue-50 w-7 h-7 flex items-center justify-center rounded-lg shadow-sm' : 'text-gray-400'}`}>
                                            {format(day, 'd')}
                                        </span>

                                        <div className="mt-2 space-y-1">
                                            {order && (
                                                <div className="flex flex-col items-center justify-center rounded-lg bg-blue-600 py-1 text-[9px] font-black text-white shadow-lg shadow-blue-100">
                                                    <span>{order.totalQty.toFixed(1)}L</span>
                                                </div>
                                            )}
                                            {dayBills.length > 0 && (
                                                <div className="flex items-center justify-center rounded-lg bg-emerald-500 py-1 text-[9px] font-black text-white shadow-lg shadow-emerald-100 italic">
                                                    <span>₹{dayBills.reduce((s, b) => s + b.total, 0).toFixed(0)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {!order && dayBills.length === 0 && isCurrentMonth && (
                                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 py-1 text-[8px] font-bold text-gray-300">
                                                    + LOG
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="space-y-4 pb-12">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Recent POS Transactions</h3>
                        {customerBills.slice(0, 5).map(bill => (
                            <div key={bill.id} className="flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 group hover:ring-blue-100 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ShoppingBagIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-sm uppercase">{bill.items.map(i => i.name).join(', ')}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{format(parseISO(bill.date), 'EEEE, MMM do yyyy')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900 tracking-tight">₹{bill.total.toFixed(2)}</p>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase">Paid</p>
                                </div>
                            </div>
                        ))}
                        {customerBills.length === 0 && (
                            <div className="p-10 text-center rounded-[32px] border-2 border-dashed border-gray-100 text-gray-400 font-bold text-sm">
                                No POS bill history found for this customer.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Sale Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
                    <div className="relative w-full max-w-md rounded-[40px] bg-white p-8 shadow-2xl ring-1 ring-gray-100">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-50">
                                    <PlusIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Add Product Sale</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Post to Transaction History</p>
                                </div>
                            </div>
                            <button onClick={() => setIsProductModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProductSale} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Select Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-black font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all shadow-inner"
                                        value={productFormData.date}
                                        onChange={e => setProductFormData({ ...productFormData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Select Product</label>
                                    <select
                                        required
                                        className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-black font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all shadow-inner"
                                        value={productFormData.productId}
                                        onChange={e => handleProductSelect(e.target.value)}
                                    >
                                        <option value="">-- Choose Item --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name.toUpperCase()} (₹{p.price}/{p.unit})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Sale Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                required
                                                className="w-full rounded-2xl bg-gray-50 pl-8 pr-4 py-4 text-black font-black outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all shadow-inner"
                                                value={productFormData.price}
                                                onChange={e => setProductFormData({ ...productFormData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Quantity</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-black font-black outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all shadow-inner"
                                            value={productFormData.quantity}
                                            onChange={e => setProductFormData({ ...productFormData, quantity: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full h-16 rounded-[24px] bg-emerald-600 text-sm font-black text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <CheckBadgeIcon className="h-6 w-6" />
                                SAVE TRANSACTION
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Edit Modal (Milk Only) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm rounded-[40px] bg-white p-8 shadow-2xl ring-1 ring-gray-100">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${editData.orderId ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                                    <BeakerIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">{editData.orderId ? 'Update Log' : 'Log Delivery'}</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{format(selectedDate, 'MMM do, yyyy')}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOrder} className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase text-gray-400">Total Liters</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="w-20 bg-white border-2 border-transparent rounded-xl px-3 py-2 text-black font-black text-lg focus:border-blue-500 outline-none transition-all shadow-sm"
                                            value={editData.liters}
                                            onChange={(e) => setEditData({ ...editData, liters: e.target.value })}
                                            required
                                        />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Liters</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase text-gray-400">Add Grams</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="50"
                                            className="w-20 bg-white border-2 border-transparent rounded-xl px-3 py-2 text-black font-black text-lg focus:border-blue-500 outline-none transition-all shadow-sm"
                                            value={editData.grams}
                                            onChange={(e) => setEditData({ ...editData, grams: e.target.value })}
                                            required
                                        />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">ML/GR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {editData.orderId && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteOrder}
                                        className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-red-50"
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 h-14 rounded-2xl bg-blue-600 text-sm font-black text-white shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    {editData.orderId ? 'SAVE CHANGES' : 'CONFIRM LOG'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.95; transform: scale(1.01); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}

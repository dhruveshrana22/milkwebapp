'use client';

import { useState } from 'react';
import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import {
    CheckCircleIcon,
    ShoppingBagIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/solid";

export default function Orders() {
    const { customers, orders, addOrder, deleteOrder } = useData();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Group orders by date for quick lookup
    const dateOrders = orders.filter(o => o.date === selectedDate);
    const getOrderForCustomer = (customerId) => dateOrders.find(o => o.customerId === customerId);

    const [quantities, setQuantities] = useState({});

    const handleQuantityChange = (customerId, field, value) => {
        setQuantities(prev => ({
            ...prev,
            [customerId]: {
                ...(prev[customerId] || { liters: '', grams: '' }),
                [field]: value
            }
        }));
    };

    const handleLogDelivery = (customer) => {
        const qty = quantities[customer.id] || { liters: customer.defaultQty, grams: '0' };
        addOrder({
            customerId: customer.id,
            customerName: customer.name,
            date: selectedDate,
            liters: qty.liters || 0,
            grams: qty.grams || 0
        });
        // Reset local quantity state for this customer
        const newQuants = { ...quantities };
        delete newQuants[customer.id];
        setQuantities(newQuants);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Log</h1>
                    <p className="text-gray-500">Record milk delivery for {format(new Date(selectedDate), 'MMMM do, yyyy')}</p>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm ring-1 ring-gray-100">
                    <button
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() - 1);
                            setSelectedDate(format(d, 'yyyy-MM-dd'));
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <input
                        type="date"
                        className="border-none bg-transparent text-sm font-semibold text-black focus:ring-0 outline-none px-2"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 1);
                            setSelectedDate(format(d, 'yyyy-MM-dd'));
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {customers.map((customer) => {
                    const order = getOrderForCustomer(customer.id);
                    const currentQty = quantities[customer.id] || { liters: customer.defaultQty, grams: '0' };

                    return (
                        <div key={customer.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 transition-all ${order ? 'ring-green-100 bg-green-50/30' : 'ring-gray-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${order ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {order ? <CheckCircleIcon className="h-7 w-7" /> : <ShoppingBagIcon className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 uppercase">{customer.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Default: {customer.defaultQty}L</p>
                                </div>
                            </div>

                            {order ? (
                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                    <div className="text-right">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Delivered</p>
                                        <p className="text-xl font-black text-gray-900">{order.totalQty.toFixed(2)} <span className="text-sm font-normal text-gray-400">Liters</span></p>
                                    </div>
                                    <button
                                        onClick={() => deleteOrder(order.id)}
                                        className="rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        Undo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                        <input
                                            type="number"
                                            placeholder="Litre"
                                            className="w-16 bg-transparent px-2 py-1 text-sm font-bold text-black border-none focus:ring-0 outline-none text-center"
                                            value={currentQty.liters}
                                            onChange={(e) => handleQuantityChange(customer.id, 'liters', e.target.value)}
                                        />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase mr-2 border-r border-gray-200 pr-2 leading-none">L</span>
                                        <input
                                            type="number"
                                            placeholder="Grams"
                                            step="50"
                                            className="w-16 bg-transparent px-2 py-1 text-sm font-bold border-none focus:ring-0 outline-none text-center"
                                            value={currentQty.grams}
                                            onChange={(e) => handleQuantityChange(customer.id, 'grams', e.target.value)}
                                        />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase mr-1 leading-none">G</span>
                                    </div>
                                    <button
                                        onClick={() => handleLogDelivery(customer)}
                                        className="flex-1 sm:flex-none rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                                    >
                                        Log Delivery
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {customers.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-gray-500">No customers found. Add customers first to log deliveries.</p>
                </div>
            )}
        </div>
    );
}

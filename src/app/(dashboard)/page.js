'use client';

import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import Link from "next/link";
import {
    UsersIcon,
    ShoppingCartIcon,
    CubeIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
    const { customers, bills, milkTypes, products } = useData();
    const today = new Date().toISOString().split('T')[0];

    const todayBills = bills.filter(b => b.date === today);
    const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);

    const lowStockProducts = products.filter(p => parseFloat(p.stock) < 5);

    const stats = [
        { name: 'Today\'s Sales', value: `₹${todayRevenue.toFixed(0)}`, icon: ArrowTrendingUpIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { name: 'Transactions', value: todayBills.length, icon: ShoppingCartIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Active Customers', value: customers.length, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                <p className="text-gray-500 font-medium">Welcome to your Dairy Command Center.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.name} className="flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`h-7 w-7 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.name}</p>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Quick Launch */}
                <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
                    <h2 className="text-xl font-bold mb-6">Quick Launch</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/sales" className="flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors gap-3 active:scale-95">
                            <ShoppingCartIcon className="h-8 w-8" />
                            <span className="font-bold text-sm">New Bill</span>
                        </Link>
                        <Link href="/master" className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-colors gap-3 active:scale-95">
                            <CubeIcon className="h-8 w-8" />
                            <span className="font-bold text-sm">Master Entry</span>
                        </Link>
                    </div>
                </div>

                {/* Stock Alerts */}
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-600">{lowStockProducts.length} Needs Restock</span>
                    </div>
                    <div className="space-y-4">
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-100">
                                <div className="flex items-center gap-3">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                    <span className="font-bold text-gray-900 uppercase">{p.name}</span>
                                </div>
                                <span className="font-black text-red-600">{p.stock} {p.unit}</span>
                            </div>
                        ))}
                        {lowStockProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-50">
                                <CheckBadgeIcon className="h-10 w-10 mb-2" />
                                <p className="text-sm font-bold">All stock levels healthy!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckBadgeIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.745 3.745 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
    );
}

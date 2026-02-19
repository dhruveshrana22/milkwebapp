'use client';

import { useState, useMemo } from 'react';
import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import Link from "next/link";
import {
    UsersIcon,
    ShoppingCartIcon,
    CubeIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    BanknotesIcon,
    CreditCardIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
    const { customers, bills, products } = useData();

    const [timeFilter, setTimeFilter] = useState('Today');

    const filteredBills = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (timeFilter === 'Today') return bills.filter(b => b.date === todayStr);

        if (timeFilter === 'Weekly') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            return bills.filter(b => b.date >= startOfWeek.toISOString().split('T')[0]);
        }

        if (timeFilter === 'Monthly') {
            const startOfMonth = todayStr.substring(0, 7) + "-01";
            return bills.filter(b => b.date >= startOfMonth);
        }

        if (timeFilter === 'Yearly') {
            const startOfYear = todayStr.substring(0, 4) + "-01-01";
            return bills.filter(b => b.date >= startOfYear);
        }

        return bills;
    }, [bills, timeFilter]);

    const stats = useMemo(() => {
        const total = filteredBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
        const cash = filteredBills.filter(b => b.paymentMode === 'Cash').reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
        const online = filteredBills.filter(b => b.paymentMode === 'Online').reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);

        return [
            { name: 'Total Revenue', value: `₹${total.toFixed(0)}`, icon: ArrowTrendingUpIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
            { name: 'Cash Payment', value: `₹${cash.toFixed(0)}`, icon: BanknotesIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { name: 'Online Payment', value: `₹${online.toFixed(0)}`, icon: CreditCardIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
        ];
    }, [filteredBills]);

    const lowStockProducts = products.filter(p => parseFloat(p.stock) < 5);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-black text-gray-900 leading-tight">Dashboard</h1>
                    <p className="text-[11px] text-gray-500 font-medium">Welcome to your Dairy Command Center.</p>
                </div>
                <div className="flex bg-white p-0.5 rounded-lg shadow-sm ring-1 ring-gray-100">
                    {['Today', 'Weekly', 'Monthly', 'Yearly'].map(f => (
                        <button
                            key={f}
                            onClick={() => setTimeFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${timeFilter === f ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.name} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{stat.name}</p>
                            <p className="text-xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {/* Quick Launch */}
                <div className="rounded-xl bg-slate-900 p-5 text-white shadow-xl">
                    <h2 className="text-base font-bold mb-3">Quick Launch</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/sales" className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors gap-2 active:scale-95">
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span className="font-bold text-[11px]">New Bill</span>
                        </Link>
                        <Link href="/master" className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors gap-2 active:scale-95">
                            <CubeIcon className="h-5 w-5" />
                            <span className="font-bold text-[11px]">Master Entry</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

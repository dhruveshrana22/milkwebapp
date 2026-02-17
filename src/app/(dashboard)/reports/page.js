'use client';

import { useState, useMemo } from 'react';
import { useData } from "@/context/DataContext";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import {
    PrinterIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    MapPinIcon,
    ShoppingBagIcon
} from "@heroicons/react/24/outline";

export default function Reports() {
    const { bills, deleteBill } = useData();
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            const billDate = parseISO(bill.date);
            const isWithinDate = isWithinInterval(billDate, {
                start: startOfDay(parseISO(fromDate)),
                end: endOfDay(parseISO(toDate))
            });
            const matchesSearch = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            return isWithinDate && matchesSearch;
        });
    }, [bills, fromDate, toDate, searchTerm]);

    const totalRevenue = useMemo(() => filteredBills.reduce((sum, b) => sum + b.total, 0), [filteredBills]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between no-print gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
                    <p className="text-gray-500">Analyze revenue and transaction history.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                >
                    <PrinterIcon className="h-5 w-5" />
                    <span>Print Summary</span>
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 no-print">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">From Date</label>
                    <input type="date" className="w-full rounded-xl bg-gray-50 border-none px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">To Date</label>
                    <input type="date" className="w-full rounded-xl bg-gray-50 border-none px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Search Customer</label>
                    <input type="text" placeholder="Search..." className="w-full rounded-xl bg-gray-50 border-none px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Revenue</p>
                    <p className="mt-1 text-2xl font-black">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg shadow-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Transactions</p>
                    <p className="mt-1 text-2xl font-black">{filteredBills.length}</p>
                </div>
            </div>

            {/* Bills List */}
            <div className="space-y-4">
                {filteredBills.map(bill => (
                    <div key={bill.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                    <ShoppingBagIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 uppercase">{bill.customerName}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                        <span className="font-bold">{format(parseISO(bill.date), 'dd MMM yyyy')}</span>
                                        <span className="h-1 w-1 rounded-full bg-gray-200"></span>
                                        <span className="uppercase">{bill.items.length} Items</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                <div className="text-left sm:text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Grand Total</p>
                                    <p className="text-xl font-black text-slate-900 font-mono tracking-tight">₹{bill.total.toFixed(2)}</p>
                                </div>
                                <button onClick={() => deleteBill(bill.id)} className="p-2 text-gray-300 hover:text-red-500 no-print transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Bill Preview (Mini) */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-gray-50 overflow-x-auto no-print">
                            {bill.items.map((item, idx) => (
                                <div key={idx} className="rounded-lg bg-gray-50 px-3 py-2 text-[10px]">
                                    <p className="font-bold text-gray-600 uppercase truncate">{item.name}</p>
                                    <p className="text-gray-400">{item.quantity} {item.unit} × ₹{item.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredBills.length === 0 && (
                    <div className="py-20 text-center rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-medium">No transactions found for the selected filters.</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .max-w-5xl { max-width: 100% !important; }
          .shadow-sm, .shadow-lg, .shadow-2xl { box-shadow: none !important; }
          .ring-1 { border: 1px solid #f3f4f6 !important; ring: none !important; }
        }
      `}</style>
        </div>
    );
}

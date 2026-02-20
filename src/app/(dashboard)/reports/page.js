'use client';

import { useState, useMemo } from 'react';
import { useData } from "@/context/DataContext";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import * as XLSX from 'xlsx';
import {
    PrinterIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    TrashIcon as TrashIconSolid,
    ShoppingBagIcon,
    TableCellsIcon,
    ChartBarIcon
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

    const stats = useMemo(() => {
        const total = filteredBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
        const cash = filteredBills.filter(b => b.paymentMode === 'Cash').reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
        const online = filteredBills.filter(b => b.paymentMode === 'Online').reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);

        return {
            total,
            cash,
            online,
            count: filteredBills.length
        };
    }, [filteredBills]);

    const handleExportExcel = () => {
        if (filteredBills.length === 0) return alert('No data to export');

        const exportData = filteredBills.map(bill => ({
            'Date': format(parseISO(bill.date), 'dd-MM-yyyy'),
            'Customer Name': bill.customerName,
            'Items Count': bill.items.length,
            'Payment Mode': bill.paymentMode || 'N/A',
            'Amount (₹)': parseFloat(bill.total).toFixed(2)
        }));

        // Add Total Row for Excel
        exportData.push({
            'Date': 'TOTAL',
            'Customer Name': '',
            'Items Count': '',
            'Payment Mode': '',
            'Amount (₹)': stats.total.toFixed(2)
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

        // Auto-size columns
        const maxWidth = exportData.reduce((w, r) => Math.max(w, r['Customer Name'].length), 15);
        worksheet['!cols'] = [
            { wch: 12 }, // Date
            { wch: maxWidth + 5 }, // Customer
            { wch: 12 }, // Items
            { wch: 15 }, // Payment Mode
            { wch: 15 }  // Amount
        ];

        XLSX.writeFile(workbook, `Sales_Report_${fromDate}_to_${toDate}.xlsx`);
    };

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto px-4 py-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between no-print gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 leading-none">Sales Reports</h1>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1.5">Business Intelligence Ledger</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-black text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        <span>Export Excel</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black text-white shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        <PrinterIcon className="h-3.5 w-3.5" />
                        <span>Print Report</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Revenue", value: stats.total, color: "bg-blue-600", text: "text-white" },
                    { label: "Cash", value: stats.cash, color: "bg-emerald-600", text: "text-white" },
                    { label: "Online", value: stats.online, color: "bg-purple-600", text: "text-white" },
                    { label: "Transactions", value: stats.count, color: "bg-slate-900", text: "text-white", isCurrency: false }
                ].map((stat, i) => (
                    <div key={i} className={`rounded-2xl ${stat.color} px-4 py-3.5 ${stat.text} shadow-lg ring-1 ring-white/10`}>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">{stat.label}</p>
                        <p className="mt-1 text-xl font-black tabular-nums">
                            {stat.isCurrency === false ? stat.value : `₹${stat.value.toFixed(0)}`}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 no-print">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">From Date</label>
                    <input
                        type="date"
                        className="w-full rounded-xl bg-gray-50 border-none px-3.5 py-2 text-[13px] font-bold text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">To Date</label>
                    <input
                        type="date"
                        className="w-full rounded-xl bg-gray-50 border-none px-3.5 py-2 text-[13px] font-bold text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Search Customer</label>
                    <input
                        type="text"
                        placeholder="Type name here..."
                        className="w-full rounded-xl bg-gray-50 border-none px-3.5 py-2 text-[13px] font-bold text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Transaction Table */}
            <div className="rounded-2xl bg-white shadow-lg shadow-gray-200/40 ring-1 ring-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Items</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 no-print text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBills.map(bill => (
                                <tr key={bill.id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-4 py-2.5 whitespace-nowrap text-[12px] font-bold text-gray-500">
                                        {format(parseISO(bill.date), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-black uppercase text-gray-900 leading-none">{bill.customerName}</span>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">#{bill.id.slice(-4)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className="text-[12px] font-black text-blue-600/60">
                                            {bill.items.length}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${bill.paymentMode === 'Cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                                            }`}>
                                            {bill.paymentMode || 'Online'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className="text-[13px] font-black text-gray-900 tabular-nums">₹{parseFloat(bill.total).toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center no-print">
                                        <button
                                            onClick={() => deleteBill(bill.id)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className=" text-black border-t-2 border-slate-800">
                                <td colSpan="4" className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Total Revenue</td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-lg font-black tabular-nums">₹{stats.total.toFixed(2)}</span>
                                </td>
                                <td className="no-print"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {filteredBills.length === 0 && (
                    <div className="py-16 text-center bg-gray-50/50">
                        <div className="flex flex-col items-center">
                            <ChartBarIcon className="h-8 w-8 text-gray-300 mb-2 stroke-1" />
                            <p className="text-[12px] font-black uppercase text-gray-400 tracking-widest">No transaction records</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    .max-w-[1600px] { max-width: 100% !important; padding: 0 !important; }
                    .shadow-xl, .shadow-sm, .shadow-lg { box-shadow: none !important; }
                    .rounded-2xl, .rounded-xl { border-radius: 0 !important; }
                    .ring-1 { border: none !important; }
                    table { width: 100% !important; border: 1px solid #eee !important; }
                    th { background-color: #f9fafb !important; color: #666 !important; -webkit-print-color-adjust: exact; }
                    tfoot tr { background-color: #0f172a !important; color: white !important; -webkit-print-color-adjust: exact; }
                    .bg-slate-900 { background-color: #0f172a !important; -webkit-print-color-adjust: exact; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
            `}</style>
        </div>
    );
}

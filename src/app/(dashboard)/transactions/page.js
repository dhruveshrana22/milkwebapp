'use client';

import { useState, useMemo } from 'react';
import { useData } from "@/context/DataContext";
import {
    DocumentTextIcon,
    XMarkIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    BanknotesIcon,
    CreditCardIcon
} from "@heroicons/react/24/outline";

export default function TransactionsPage() {
    const { bills, customers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    // Filtered Bills
    const filteredBills = useMemo(() => {
        return bills
            .filter(b => {
                const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesPayment = paymentFilter === 'All' || b.paymentMode === paymentFilter;

                let matchesDate = true;
                if (fromDate) matchesDate = matchesDate && b.date >= fromDate;
                if (toDate) matchesDate = matchesDate && b.date <= toDate;

                return matchesSearch && matchesPayment && matchesDate;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [bills, searchTerm, paymentFilter, fromDate, toDate]);

    const grandTotal = useMemo(() => {
        return filteredBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
    }, [filteredBills]);

    const handleViewInvoice = (bill) => {
        setSelectedBill(bill);
        setShowInvoiceModal(true);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Print Header (Only visible on print) */}
            <div className="hidden print:block mb-8 border-b-2 border-slate-200 pb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Sales Transaction Report</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            {fromDate && toDate ? `Period: ${fromDate} to ${toDate}` : 'Full Transaction History'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400">Grand Total Amount</p>
                        <p className="text-2xl font-black text-blue-600">₹{grandTotal.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 no-print">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Transactions</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 underline decoration-blue-500/30 decoration-2 underline-offset-4">Comprehensive Sales History</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Report
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 relative">
                        <input
                            type="text"
                            placeholder="Search customer name..."
                            className="w-full rounded-2xl border-none bg-white p-4 pl-12 text-sm font-bold text-gray-900 shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 gap-2">
                        <div className="relative">
                            <span className="absolute top-1 left-3 text-[8px] font-black text-gray-400 uppercase tracking-tighter">From</span>
                            <input
                                type="date"
                                className="w-full rounded-2xl border-none bg-white p-4 pt-6 text-[11px] font-black text-gray-900 shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute top-1 left-3 text-[8px] font-black text-gray-400 uppercase tracking-tighter">To</span>
                            <input
                                type="date"
                                className="w-full rounded-2xl border-none bg-white p-4 pt-6 text-[11px] font-black text-gray-900 shadow-sm ring-1 ring-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3 flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm ring-1 ring-gray-100">
                        {['All', 'Cash', 'Online'].map(f => (
                            <button
                                key={f}
                                onClick={() => setPaymentFilter(f)}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentFilter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="md:col-span-2 bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100 text-white flex flex-col justify-center">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Total Sum</p>
                        <p className="text-xl font-black tracking-tight leading-none">₹{grandTotal.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm ring-1 ring-gray-100 overflow-hidden printable-section">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Method</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Amount</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right no-print">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBills.map((bill) => (
                                <tr key={bill.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="p-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase font-mono tracking-tighter">#{bill.id.slice(-8).toUpperCase()}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-gray-900 uppercase text-xs">{bill.customerName}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <p className="text-xs font-black text-gray-600 font-mono tracking-tighter">{bill.date}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${bill.paymentMode === 'Cash' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                            }`}>
                                            {bill.paymentMode === 'Cash' ? <BanknotesIcon className="h-3 w-3 no-print" /> : <CreditCardIcon className="h-3 w-3 no-print" />}
                                            {bill.paymentMode}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <p className="font-black text-gray-900 text-sm">₹{parseFloat(bill.total).toFixed(0)}</p>
                                    </td>
                                    <td className="p-6 text-right no-print">
                                        <button
                                            onClick={() => handleViewInvoice(bill)}
                                            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                                        >
                                            <DocumentTextIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50/80 border-t-2 border-gray-100">
                                <td colSpan="4" className="p-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Grand Total</td>
                                <td className="p-6 text-right">
                                    <p className="text-lg font-black text-blue-600">₹{grandTotal.toFixed(0)}</p>
                                </td>
                                <td className="no-print"></td>
                            </tr>
                        </tfoot>
                    </table>
                    {filteredBills.length === 0 && (
                        <div className="py-24 text-center no-print">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gray-50 mb-4">
                                <FunnelIcon className="h-10 w-10 text-gray-200" />
                            </div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-[.3em]">No matching transactions</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Modal */}
            {showInvoiceModal && selectedBill && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 no-print">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowInvoiceModal(false)}></div>
                    <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white overflow-hidden shadow-3xl">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">INVOICE</h2>
                                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Transaction Details</p>
                                </div>
                                <button onClick={() => setShowInvoiceModal(false)} className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                                    <XMarkIcon className="h-6 w-6 stroke-2" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-10 py-8 border-y border-gray-50">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer</p>
                                    <p className="font-black text-gray-900 uppercase text-sm">{selectedBill.customerName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">ID: #{selectedBill.id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date</p>
                                    <p className="font-black text-gray-900 text-sm">{selectedBill.date}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-12 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                                    <div className="col-span-6">Description</div>
                                    <div className="col-span-2 text-center">Qty</div>
                                    <div className="col-span-4 text-right">Amount</div>
                                </div>
                                <div className="space-y-4 max-h-[250px] overflow-y-auto px-2 custom-scrollbar">
                                    {selectedBill.items.map((item, i) => (
                                        <div key={i} className="grid grid-cols-12 items-center text-xs">
                                            <div className="col-span-6">
                                                <p className="font-black text-gray-900 uppercase truncate">{item.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{item.variantLabel}</p>
                                            </div>
                                            <div className="col-span-2 text-center">
                                                <span className="font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{item.quantity}</span>
                                            </div>
                                            <div className="col-span-4 text-right font-black text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-50">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Mode</p>
                                    <p className="text-xs font-black text-gray-900 uppercase bg-gray-50 px-3 py-1.5 rounded-xl">{selectedBill.paymentMode}</p>
                                </div>
                                <div className="flex justify-between items-center bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100">
                                    <p className="text-lg font-black uppercase tracking-tight opacity-80">Total Amount</p>
                                    <p className="text-4xl font-black">₹{parseFloat(selectedBill.total).toFixed(0)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-2">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center justify-center gap-2 py-5 rounded-[2rem] bg-gray-900 text-white text-xs font-black hover:bg-black transition-all shadow-xl shadow-gray-200"
                                >
                                    <PlusIcon className="h-4 w-4" strokeWidth={3} />
                                    PRINT
                                </button>
                                <button
                                    onClick={() => setShowInvoiceModal(false)}
                                    className="flex items-center justify-center gap-2 py-5 rounded-[2rem] bg-gray-50 text-gray-900 text-xs font-black hover:bg-gray-100 transition-all"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                
                @media print {
                    @page { 
                        margin: 1.5cm;
                        size: A4 portrait;
                    }
                    
                    body * {
                        visibility: hidden;
                    }
                    
                    .printable-section, .printable-section *, .print:block, .print:block * {
                        visibility: visible;
                    }
                    
                    .printable-section {
                        position: absolute !important;
                        left: 0 !important;
                        top: 100px !important; /* Space for the print header */
                        width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-top: 1px solid #eee !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    table th {
                        background-color: #f8fafc !important;
                        border-bottom: 2px solid #000 !important;
                        color: #000 !important;
                        font-weight: 900 !important;
                    }

                    table td {
                        border-bottom: 1px solid #f1f5f9 !important;
                        color: #000 !important;
                        padding: 12px 16px !important;
                    }

                    .printable-section tfoot td {
                        border-top: 2px solid #000 !important;
                        background: #fff !important;
                    }
                }
            `}</style>
        </div>
    );
}

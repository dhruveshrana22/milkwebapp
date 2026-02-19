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
    XMarkIcon,
    CurrencyRupeeIcon,
    CubeIcon,
    TagIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import Link from 'next/link';

export default function CustomerDetail({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const { customers, bills, products, addBill, updateCustomer } = useData();

    const customer = customers.find(c => c.id === id);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Selection State
    const [selectedDate, setSelectedDate] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Product Transaction State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [productFormData, setProductFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        productId: '',
        price: '',
        quantity: '1'
    });

    // Customer specific bills
    const customerBills = useMemo(() => {
        return bills.filter(b => b.customerId === id);
    }, [bills, id]);

    // Construct Ledger (Bills + Payments)
    const ledger = useMemo(() => {
        // Bills are "Lena" (DR)
        const entries = customerBills.map(b => ({
            id: b.id,
            date: b.date,
            description: `INVOICE BILL-${b.id.slice(-4).toUpperCase()}`,
            type: 'bill',
            lena: parseFloat(b.total) || 0,
            dena: 0
        }));

        // Payments are "Dena" (CR)
        const paymentEntries = (customer.payments || []).map(p => ({
            id: p.id,
            date: p.date,
            description: 'CASH PAYMENT RECEIVED',
            type: 'payment',
            lena: 0,
            dena: parseFloat(p.amount) || 0
        }));

        const combined = [...entries, ...paymentEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate Running Balance
        let currentBal = parseFloat(customer.oldBalance || 0);
        return combined.map(entry => {
            currentBal = currentBal + entry.lena - entry.dena;
            return { ...entry, balance: currentBal };
        }).reverse(); // Latest on top for view
    }, [customerBills, customer.payments, customer.oldBalance]);

    // Financial calculations for cards
    const stats = useMemo(() => {
        const oldBalance = parseFloat(customer.oldBalance || 0);
        const totalBill = customerBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
        const totalPaid = (customer.payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const totalRaaki = oldBalance + totalBill - totalPaid;

        return { oldBalance, totalBill, totalPaid, totalRaaki };
    }, [customerBills, customer.payments, customer.oldBalance]);

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <XMarkIcon className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Customer not found</h2>
            </div>
        );
    }

    const handleProductSelect = (pid) => {
        const prod = products.find(p => p.id === pid);
        if (prod) {
            setProductFormData({
                ...productFormData,
                productId: pid,
                price: prod.sale_price || prod.price
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
            items: [{ id: prod.id, productId: prod.id, name: prod.name, type: 'product', price: productFormData.price, quantity: productFormData.quantity, unit: prod.unit_type || prod.unit }],
            total: total
        });
        setIsProductModalOpen(false);
    };

    const handlePayment = (e) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        const newPayment = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            amount: amount
        };

        const updatedPayments = [...(customer.payments || []), newPayment];
        updateCustomer(customer.id, { payments: updatedPayments });

        setIsPaymentModalOpen(false);
        setPaymentAmount('');
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-10 max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <Link href="/customers" className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 transition-all">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 uppercase leading-none">{customer.name}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Lenden Ka Hisab - Grahak</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-6 py-2.5 bg-[#00A36C] text-white rounded-xl font-black text-xs tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <CurrencyRupeeIcon className="h-4 w-4" />
                        Payment Entry
                    </button>
                    <button
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-900 transition-all"
                        onClick={() => window.print()}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-between min-h-[100px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Old Balance</p>
                    <p className="text-2xl font-black text-gray-900">₹{stats.oldBalance.toFixed(0)}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-between min-h-[100px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bill</p>
                    <p className="text-2xl font-black text-gray-900">₹{stats.totalBill.toFixed(0)}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-between min-h-[100px]">
                    <p className="text-[10px] font-black text-[#00A36C] uppercase tracking-widest">Total Paid</p>
                    <p className="text-2xl font-black text-[#00A36C]">₹{stats.totalPaid.toFixed(0)}</p>
                </div>
                <div className="bg-[#E30613] p-5 rounded-3xl shadow-xl flex flex-col justify-between min-h-[100px] text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Raaki</p>
                    <p className="text-2xl font-black tracking-tight">₹{stats.totalRaaki.toFixed(0)}</p>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden printable-section">
                {/* Print Only Header */}
                <div className="print-header px-6 py-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-black uppercase">{customer.name}</h1>
                            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Account Ledger Statement</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-gray-400">Total Outstanding</p>
                            <p className="text-xl font-black text-[#E30613]">₹{stats.totalRaaki.toFixed(0)}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between no-print">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                        <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Account Ledger Log</h2>
                    </div>
                    <span className="text-[10px] font-black text-gray-400">{ledger.length} ENTRIES</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date/ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Particulars (Detail)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"> (DR)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"> (CR)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ledger.map((entry, idx) => (
                                <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-gray-900">{format(parseISO(entry.date), 'd/M/yyyy')}</p>
                                        <p className="text-[9px] font-bold text-gray-400 tracking-tighter">#{entry.id.slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-gray-900 uppercase">{entry.description}</p>
                                        <p className="text-[9px] font-bold text-blue-600 uppercase">Sales</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {entry.lena > 0 && <span className="text-sm font-black text-[#E30613]">₹{entry.lena.toFixed(0)}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {entry.dena > 0 && <span className="text-sm font-black text-[#00A36C]">₹{entry.dena.toFixed(0)}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-gray-900">₹{entry.balance.toFixed(0)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center no-print">
                                        <button className="text-gray-300 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100">
                                            <TagIcon className="h-4 w-4 mx-auto" strokeWidth={3} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {ledger.length === 0 && (
                        <div className="py-20 text-center">
                            <CubeIcon className="h-12 w-12 text-gray-100 mx-auto mb-3" />
                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No entries found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Paisa Entry Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 no-print">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6 text-center">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CurrencyRupeeIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Paisa Entry</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Record Cash Settlement</p>
                            </div>
                            <form onSubmit={handlePayment} className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400">₹</span>
                                    <input
                                        autoFocus
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="w-full rounded-2xl bg-gray-50 pl-10 pr-5 py-5 text-2xl font-black text-gray-900 outline-none ring-1 ring-gray-100 focus:ring-[#00A36C] transition-all"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-900 transition-all">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 rounded-2xl bg-[#00A36C] text-white font-black text-xs tracking-widest uppercase shadow-xl shadow-emerald-100 hover:opacity-90 transition-all">Submit Entry</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page { 
                        margin: 1.5cm;
                        size: A4;
                    }
                    
                    /* Hide everything by default */
                    body * {
                        visibility: hidden;
                    }
                    
                    /* Only show the ledger section */
                    .printable-section, .printable-section * {
                        visibility: visible;
                    }
                    
                    /* Position the printable section at the top */
                    .printable-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    /* Formatting for print */
                    .printable-section table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    .printable-section th {
                        background-color: #f8fafc !important;
                        border-bottom: 2px solid #000 !important;
                        color: #000 !important;
                        text-transform: uppercase;
                        font-weight: 900;
                        font-size: 10px;
                        padding: 12px 8px !important;
                    }

                    .printable-section td {
                        border-bottom: 1px solid #eee !important;
                        padding: 10px 8px !important;
                        color: #000 !important;
                    }

                    /* Header for print */
                    .print-header {
                        display: block !important;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #eee;
                        padding-bottom: 15px;
                    }

                    .no-print {
                        display: none !important;
                    }
                }
                
                .print-header {
                    display: none;
                }
            `}</style>
        </div>
    );
}

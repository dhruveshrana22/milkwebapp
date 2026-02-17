'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [customers, setCustomers] = useState([]);
    const [milkTypes, setMilkTypes] = useState([]); // { id, name, fat, unit, price }
    const [products, setProducts] = useState([]); // { id, name, unit, price, stock }
    const [orders, setOrders] = useState([]); // Daily milk logs
    const [bills, setBills] = useState([]); // POS transactions
    const [loading, setLoading] = useState(true);

    // Load data from LocalStorage on mount
    useEffect(() => {
        const savedCustomers = localStorage.getItem('milk_customers');
        const savedMilkTypes = localStorage.getItem('milk_types');
        const savedProducts = localStorage.getItem('milk_products');
        const savedBills = localStorage.getItem('milk_bills');
        const savedOrders = localStorage.getItem('milk_orders');

        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        if (savedMilkTypes) setMilkTypes(JSON.parse(savedMilkTypes));
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedBills) setBills(JSON.parse(savedBills));
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        setLoading(false);
    }, []);

    // Sync to LocalStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('milk_customers', JSON.stringify(customers));
            localStorage.setItem('milk_types', JSON.stringify(milkTypes));
            localStorage.setItem('milk_products', JSON.stringify(products));
            localStorage.setItem('milk_bills', JSON.stringify(bills));
            localStorage.setItem('milk_orders', JSON.stringify(orders));
        }
    }, [customers, milkTypes, products, bills, orders, loading]);

    // Customer Actions
    const addCustomer = (customer) => setCustomers(prev => [...prev, { ...customer, id: Date.now().toString() }]);
    const updateCustomer = (id, data) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    const deleteCustomer = (id) => setCustomers(prev => prev.filter(c => c.id !== id));

    // Milk Master Actions
    const addMilkType = (type) => setMilkTypes(prev => [...prev, { ...type, id: Date.now().toString() }]);
    const updateMilkType = (id, data) => setMilkTypes(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    const deleteMilkType = (id) => setMilkTypes(prev => prev.filter(t => t.id !== id));

    // Product Actions
    const addProduct = (product) => setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
    const updateProduct = (id, data) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

    // Order Actions (Daily Logs)
    const addOrder = (order) => {
        const totalQty = parseFloat(order.liters || 0) + (parseFloat(order.grams || 0) / 1000);
        setOrders(prev => [...prev, { ...order, id: Date.now().toString(), totalQty }]);
    };
    const updateOrder = (id, data) => {
        const totalQty = parseFloat(data.liters || 0) + (parseFloat(data.grams || 0) / 1000);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data, totalQty } : o));
    };
    const deleteOrder = (id) => setOrders(prev => prev.filter(o => o.id !== id));

    // Bill Actions
    const addBill = (bill) => {
        const newBill = { ...bill, id: Date.now().toString(), date: bill.date || new Date().toISOString().split('T')[0] };
        setBills(prev => [newBill, ...prev]);

        // Update stock for products
        bill.items.forEach(item => {
            if (item.type === 'product') {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    updateProduct(product.id, { stock: parseFloat(product.stock) - parseFloat(item.quantity) });
                }
            }
        });
    };

    const deleteBill = (id) => setBills(prev => prev.filter(b => b.id !== id));

    return (
        <DataContext.Provider value={{
            customers, addCustomer, updateCustomer, deleteCustomer,
            milkTypes, addMilkType, updateMilkType, deleteMilkType,
            products, addProduct, updateProduct, deleteProduct,
            orders, addOrder, updateOrder, deleteOrder,
            bills, addBill, deleteBill,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};

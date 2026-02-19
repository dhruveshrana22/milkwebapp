'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]); // Daily milk logs
    const [bills, setBills] = useState([]); // POS transactions
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load data from LocalStorage on mount
    useEffect(() => {
        const savedCustomers = localStorage.getItem('milk_customers');
        const savedProducts = localStorage.getItem('milk_products');
        const savedBills = localStorage.getItem('milk_bills');
        const savedOrders = localStorage.getItem('milk_orders');
        const savedCategories = localStorage.getItem('milk_categories');

        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedBills) setBills(JSON.parse(savedBills));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedCategories) setCategories(JSON.parse(savedCategories));

        setLoading(false);
    }, []);

    // Sync to LocalStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('milk_customers', JSON.stringify(customers));
            localStorage.setItem('milk_products', JSON.stringify(products));
            localStorage.setItem('milk_bills', JSON.stringify(bills));
            localStorage.setItem('milk_orders', JSON.stringify(orders));
            localStorage.setItem('milk_categories', JSON.stringify(categories));
        }
    }, [customers, products, bills, orders, categories, loading]);

    // Customer Actions
    const addCustomer = (customer) => setCustomers(prev => [...prev, { ...customer, id: Date.now().toString() }]);
    const updateCustomer = (id, data) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    const deleteCustomer = (id) => setCustomers(prev => prev.filter(c => c.id !== id));

    // Product Actions
    const addProduct = (product) => setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
    const updateProduct = (id, data) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

    // Category Actions
    const addCategory = (category) => setCategories(prev => [...prev, { ...category, id: Date.now().toString() }]);
    const updateCategory = (id, data) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

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
                    // Simple stock reduction, might need adjustment for variants
                    const stockReduction = parseFloat(item.quantity) || 0;
                    updateProduct(product.id, { stock: (parseFloat(product.stock) || 0) - stockReduction });
                }
            }
        });
    };

    const deleteBill = (id) => setBills(prev => prev.filter(b => b.id !== id));

    return (
        <DataContext.Provider value={{
            customers, addCustomer, updateCustomer, deleteCustomer,
            products, addProduct, updateProduct, deleteProduct,
            categories, addCategory, updateCategory, deleteCategory,
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

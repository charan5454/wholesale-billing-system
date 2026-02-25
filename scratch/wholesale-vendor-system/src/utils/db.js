const DB_KEY = 'wholesale_pro_db'

const initialState = {
    vendors: [],
    bills: [],
    payments: [],
    products: [
        { id: '1', name: 'Milk', price: 60 },
        { id: '2', name: 'Biscuits', price: 20 },
        { id: '3', name: 'Eggs', price: 6 }
    ]
}

export const getDB = () => {
    const data = localStorage.getItem(DB_KEY)
    const db = data ? JSON.parse(data) : initialState
    // Ensure products array exists
    if (!db.products) {
        db.products = initialState.products
    }
    return db
}

export const saveDB = (data) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data))
}

// Product Operations
export const addProduct = (product) => {
    const db = getDB()
    const newProduct = {
        ...product,
        id: Date.now().toString()
    }
    db.products.push(newProduct)
    saveDB(db)
    return newProduct
}

export const updateProduct = (id, updates) => {
    const db = getDB()
    db.products = db.products.map(p => p.id === id ? { ...p, ...updates } : p)
    saveDB(db)
}

export const deleteProduct = (id) => {
    const db = getDB()
    db.products = db.products.filter(p => p.id !== id)
    saveDB(db)
}

// Vendor Operations
export const addVendor = (vendor) => {
    const db = getDB()
    const newVendor = {
        ...vendor,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pendingBalance: 0
    }
    db.vendors.push(newVendor)
    saveDB(db)
    return newVendor
}

export const deleteVendor = (id) => {
    const db = getDB()
    db.vendors = db.vendors.filter(v => v.id !== id)
    db.bills = db.bills.filter(b => b.vendorId !== id)
    db.payments = db.payments.filter(p => p.vendorId !== id)
    saveDB(db)
}

export const updateVendor = (id, updates) => {
    const db = getDB()
    db.vendors = db.vendors.map(v => v.id === id ? { ...v, ...updates } : v)
    saveDB(db)
}

// Bill Operations
export const addBill = (bill) => {
    const db = getDB()
    const newBill = {
        ...bill,
        id: 'BILL-' + Date.now(),
        date: bill.date || new Date().toISOString()
    }

    db.bills.push(newBill)

    // Update vendor pending balance
    const balanceChange = newBill.finalAmount - newBill.paidToday
    if (balanceChange !== 0) {
        const vendor = db.vendors.find(v => v.id === bill.vendorId)
        if (vendor) {
            vendor.pendingBalance += balanceChange
        }
    }

    saveDB(db)
    return newBill
}

// History Helpers
export const getVendorHistory = (vendorId) => {
    const db = getDB()
    return db.bills
        .filter(b => b.vendorId === vendorId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
}

// Payment Operations
export const addPayment = (payment) => {
    const db = getDB()
    const newPayment = {
        ...payment,
        id: 'PAY-' + Date.now(),
        date: payment.date || new Date().toISOString()
    }

    db.payments.push(newPayment)

    // Reduce vendor pending balance
    const vendor = db.vendors.find(v => v.id === payment.vendorId)
    if (vendor) {
        vendor.pendingBalance -= payment.amount
    }

    saveDB(db)
    return newPayment
}

// Dashboard Helpers
export const getDashboardStats = () => {
    const db = getDB()

    const totalSales = db.bills
        .reduce((sum, b) => sum + b.finalAmount, 0)

    const totalReceived = [
        ...db.bills.map(b => (b.paidToday || 0)),
        ...db.payments.map(p => (p.amount || 0))
    ].reduce((sum, amt) => sum + amt, 0)

    const totalPending = db.vendors.reduce((sum, v) => sum + (v.pendingBalance || 0), 0)

    return { totalSales, totalReceived, totalPending }
}

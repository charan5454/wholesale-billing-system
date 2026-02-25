import React, { useState, useEffect } from 'react'
import { getDB, addBill } from '../utils/db'

function Billing() {
    const [vendors, setVendors] = useState([])
    const [products, setProducts] = useState([])
    const [selectedVendor, setSelectedVendor] = useState(null)

    const [formData, setFormData] = useState({
        vendorId: '',
        items: [{ name: '', quantity: 0, price: 0 }],
        paidToday: 0,
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const db = getDB()
        setVendors(db.vendors)
        setProducts(db.products || [])
    }

    useEffect(() => {
        if (formData.vendorId) {
            const v = vendors.find(v => v.id === formData.vendorId)
            setSelectedVendor(v)
        } else {
            setSelectedVendor(null)
        }
    }, [formData.vendorId, vendors])

    const addItemRow = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 0, price: 0 }]
        })
    }

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items]

        if (field === 'name') {
            newItems[index][field] = value
            // Auto-fill price if product exists in database
            const product = products.find(p => p.name.toLowerCase() === value.toLowerCase())
            if (product) {
                newItems[index].price = product.price
            }
        } else {
            newItems[index][field] = parseFloat(value) || 0
        }

        setFormData({ ...formData, items: newItems })
    }

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            if (!item.name.trim()) return sum
            return sum + (item.quantity * item.price)
        }, 0)
    }

    const currentBillTotal = calculateTotal()
    const previousDue = selectedVendor ? (selectedVendor.pendingBalance || 0) : 0
    const totalDue = previousDue + currentBillTotal
    const remainingBalance = totalDue - formData.paidToday

    const handleVanishZero = (e) => {
        if (e.target.value === '0' || parseFloat(e.target.value) === 0) {
            e.target.value = ''
        }
    }

    const handleRestoreZero = (e, field, index) => {
        if (e.target.value === '') {
            if (index !== undefined) {
                updateItem(index, field, 0)
            } else {
                setFormData({ ...formData, [field]: 0 })
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.vendorId) {
            alert('Please select a vendor')
            return
        }

        // Filter out empty rows (where name is blank)
        const validItems = formData.items.filter(item => item.name.trim() !== '')

        if (validItems.length === 0 && currentBillTotal === 0 && formData.paidToday === 0) {
            if (!confirm('No items added. Save anyway?')) return
        }

        const finalBill = {
            ...formData,
            items: validItems,
            date: new Date(formData.date).toISOString(),
            total: calculateTotal(),
            finalAmount: currentBillTotal,
            remainingBalance: remainingBalance
        }

        addBill(finalBill)

        alert('Bill generated successfully!')

        // Refresh local state to reflect new balances
        loadData()

        // Reset form
        setFormData({
            vendorId: '',
            items: [{ name: '', quantity: 0, price: 0 }],
            paidToday: 0,
            date: new Date().toISOString().split('T')[0]
        })
    }

    return (
        <div className="billing-page animate-fade">
            <div className="page-header">
                <h2>Generate New Bill</h2>
                <p className="subtitle">Create sales invoices and track vendor payments</p>
            </div>

            <form onSubmit={handleSubmit} className="billing-form">
                <div className="layout-main">
                    <div className="glass section-card vendor-info-section">
                        <div className="card-header">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M17 11l2 2 4-4" /></svg>
                            </div>
                            <h3>Vendor & Date</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Select Vendor*</label>
                                <select
                                    required
                                    value={formData.vendorId}
                                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                >
                                    <option value="">-- Select Vendor --</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.shopName} ({v.phone})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Purchase Date*</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            {selectedVendor && (
                                <div className="due-status animate-bounce-in">
                                    <span className="label">Current Balance</span>
                                    <span className="value">₹{previousDue.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass section-card items-section">
                        <div className="card-header">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                            </div>
                            <h3>Bill Items</h3>
                            <button type="button" className="btn-small glass add-row-btn" onClick={addItemRow}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                                Add Row
                            </button>
                        </div>
                        <div className="items-container">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Qty</th>
                                        <th>Price/Unit</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="item-row-tr">
                                            <td className="product-cell">
                                                <input
                                                    type="text"
                                                    placeholder="Search product..."
                                                    value={item.name}
                                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                    list="product-suggestions"
                                                />
                                            </td>
                                            <td className="qty-cell">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onFocus={handleVanishZero}
                                                    onBlur={(e) => handleRestoreZero(e, 'quantity', index)}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                />
                                            </td>
                                            <td className="price-cell">
                                                <div className="price-input-wrapper small">
                                                    <span className="currency-symbol">₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.price}
                                                        onFocus={handleVanishZero}
                                                        onBlur={(e) => handleRestoreZero(e, 'price', index)}
                                                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="total-cell">
                                                ₹{(item.quantity * item.price).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="layout-sidebar">
                    <div className="glass section-card summary-card sticky-card">
                        <div className="card-header">
                            <div className="icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 7h6m-6 4h6m-6 4h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
                            </div>
                            <h3>Bill Summary</h3>
                        </div>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Sub-Total</span>
                                <span>₹{calculateTotal().toLocaleString()}</span>
                            </div>
                            <div className="summary-row important">
                                <span>Current Bill</span>
                                <span className="accent-text">₹{currentBillTotal.toLocaleString()}</span>
                            </div>

                            <div className="divider-glow"></div>

                            <div className="summary-row">
                                <span>Previous Due</span>
                                <span className="danger-text">₹{previousDue.toLocaleString()}</span>
                            </div>
                            <div className="summary-row highlight-box">
                                <span className="label">Total Payable</span>
                                <span className="value">₹{totalDue.toLocaleString()}</span>
                            </div>

                            <div className="divider-glow"></div>

                            <div className="summary-row">
                                <span>Paid Today</span>
                                <div className="price-input-wrapper small">
                                    <span className="currency-symbol">₹</span>
                                    <input
                                        type="number"
                                        className="success-text"
                                        value={formData.paidToday}
                                        onFocus={handleVanishZero}
                                        onBlur={(e) => handleRestoreZero(e, 'paidToday')}
                                        onChange={(e) => setFormData({ ...formData, paidToday: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="summary-row final-due">
                                <span>New Balance</span>
                                <span className={remainingBalance > 0 ? 'danger-text' : 'success-text'}>
                                    ₹{remainingBalance.toLocaleString()}
                                </span>
                            </div>

                            <button type="submit" className="btn-primary full-width generate-btn">
                                <span>Save Bill</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <datalist id="product-suggestions">
                {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name} (₹{p.price})</option>
                ))}
            </datalist>

            <style jsx>{`
                .billing-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 3rem;
                }

                .page-header {
                    margin-bottom: 2.5rem;
                }

                .page-header h2 {
                    font-size: 2.2rem;
                    font-weight: 800;
                    background: linear-gradient(to right, #fff, var(--accent-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0.5rem;
                }

                .subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                }

                .billing-form {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    align-items: start;
                }

                .section-card {
                    padding: 0;
                    overflow: hidden;
                    border: 1px solid var(--glass-border);
                    background: rgba(30, 41, 59, 0.4);
                    border-radius: var(--radius);
                    margin-bottom: 1.5rem;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.02);
                }

                .icon-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: var(--accent-glow);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent-color);
                }

                .card-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                    flex: 1;
                }

                .form-row {
                    padding: 1.5rem;
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-end;
                }

                .form-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .due-status {
                    min-width: 150px;
                    padding: 0.75rem 1.25rem;
                    border-radius: 12px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    display: flex;
                    flex-direction: column;
                }

                .due-status .label {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-secondary);
                }

                .due-status .value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--danger-color);
                }

                .items-container {
                    padding: 0;
                }

                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .items-table th {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-secondary);
                    background: rgba(0, 0, 0, 0.2);
                }

                .item-row-tr {
                    border-bottom: 1px solid var(--glass-border);
                }

                .item-row-tr td {
                    padding: 1rem 1.5rem;
                }

                .item-row-tr input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 8px;
                    padding: 0.6rem 0.8rem;
                    width: 100%;
                    font-size: 0.9rem;
                }

                .item-row-tr input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--accent-color);
                    box-shadow: 0 0 10px var(--accent-glow);
                }

                .qty-cell { width: 140px; }
                .price-cell { width: 160px; }
                .total-cell { 
                    width: 120px; 
                    text-align: right; 
                    font-weight: 600; 
                    color: var(--text-primary);
                }

                .price-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .currency-symbol {
                    position: absolute;
                    left: 0.75rem;
                    color: var(--accent-color);
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .price-input-wrapper input {
                    padding-left: 1.8rem !important;
                }

                .add-row-btn {
                    padding: 0.5rem 1rem;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .summary-details {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .summary-row span:last-child {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .summary-row.important {
                    font-size: 1rem;
                    font-weight: 600;
                }

                .summary-row.important .accent-text {
                    color: var(--accent-color);
                    font-size: 1.2rem;
                }

                .highlight-box {
                    background: rgba(255, 255, 255, 0.03);
                    padding: 1rem;
                    border-radius: 12px;
                    margin: 0.5rem 0;
                    border: 1px dashed var(--glass-border);
                }

                .highlight-box .label {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                }

                .highlight-box .value {
                    color: var(--danger-color);
                    font-size: 1.4rem;
                    font-weight: 800;
                }

                .final-due {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-top: 0.5rem;
                }

                .divider-glow {
                    height: 1px;
                    background: linear-gradient(to right, transparent, var(--glass-border), transparent);
                    margin: 0.5rem 0;
                }

                .small-input {
                    width: 100px;
                    text-align: right;
                    padding: 0.4rem;
                }

                .success-text { color: var(--success-color) !important; font-weight: 700 !important; }
                .danger-text { color: var(--danger-color) !important; font-weight: 700 !important; }

                .sticky-card {
                    position: sticky;
                    top: 2rem;
                }

                .generate-btn {
                    margin-top: 1rem;
                    padding: 1.25rem;
                    font-size: 1rem;
                }

                .hint-text {
                    text-align: center;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-top: 0.5rem;
                }

                @media (max-width: 1024px) {
                    .billing-form {
                        grid-template-columns: 1fr;
                    }
                    .sticky-card {
                        position: static;
                    }
                }
            `}</style>
        </div>
    )
}

export default Billing

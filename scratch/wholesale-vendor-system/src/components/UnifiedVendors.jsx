import React, { useState, useEffect } from 'react'
import { getDB, addVendor, addBill, getVendorHistory } from '../utils/db'

function UnifiedVendors({ initialVendorId }) {
    const [vendors, setVendors] = useState([])
    const [selectedVendorId, setSelectedVendorId] = useState(initialVendorId || '')
    const [history, setHistory] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [newVendor, setNewVendor] = useState({ shopName: '', phone: '', address: '' })

    const [billData, setBillData] = useState({
        items: [{ name: '', quantity: 1, price: 0, settledPrice: 0 }],
        discount: 0,
        paidToday: 0
    })

    useEffect(() => {
        loadVendors()
    }, [])

    useEffect(() => {
        if (selectedVendorId) {
            setHistory(getVendorHistory(selectedVendorId))
        } else {
            setHistory([])
        }
    }, [selectedVendorId])

    const loadVendors = () => {
        const db = getDB()
        setVendors(db.vendors)
    }

    const handleAddVendor = (e) => {
        e.preventDefault()
        if (!newVendor.shopName) return
        const vendor = addVendor(newVendor)
        loadVendors()
        setSelectedVendorId(vendor.id)
        setShowAddModal(false)
        setNewVendor({ shopName: '', phone: '', address: '' })
    }

    const addItemRow = () => {
        setBillData({
            ...billData,
            items: [...billData.items, { name: '', quantity: 1, price: 0, settledPrice: 0 }]
        })
    }

    const updateItem = (index, field, value) => {
        const newItems = [...billData.items]
        const numericValue = parseFloat(value) || 0
        newItems[index][field] = field === 'name' ? value : numericValue

        // Auto-fill settledPrice if price is entered for the first time
        if (field === 'price' && newItems[index].settledPrice === 0) {
            newItems[index].settledPrice = numericValue
        }

        setBillData({ ...billData, items: newItems })
    }

    const calculateSubTotal = () => {
        return billData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    }

    const calculateDeduction = () => {
        return billData.items.reduce((sum, item) => sum + ((item.price - item.settledPrice) * item.quantity), 0)
    }

    const totalAfterDeduction = (calculateSubTotal() || 0) - (calculateDeduction() || 0)
    const finalAmount = totalAfterDeduction - (billData.discount || 0)
    const remainingBalance = finalAmount - (billData.paidToday || 0)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!selectedVendorId || finalAmount <= 0) return

        addBill({
            vendorId: selectedVendorId,
            ...billData,
            subTotal: calculateSubTotal(),
            deduction: calculateDeduction(),
            finalAmount,
            remainingBalance
        })

        alert('Success! Bill recorded and history updated.')
        setBillData({
            items: [{ name: '', quantity: 1, price: 0, settledPrice: 0 }],
            discount: 0,
            paidToday: 0
        })
        setHistory(getVendorHistory(selectedVendorId))
    }

    return (
        <div className="unified-vendors animate-fade">
            <div className="layout-grid">
                {/* LEFT COLUMN: HISTORY & SELECT */}
                <div className="history-column">
                    <div className="glass card selection-card">
                        <div className="form-group">
                            <label className="simple-label">🏪 Select Shop</label>
                            <div className="select-row">
                                <select
                                    value={selectedVendorId}
                                    onChange={(e) => setSelectedVendorId(e.target.value)}
                                >
                                    <option value="">-- Choose Shop --</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.shopName}</option>
                                    ))}
                                </select>
                                <button className="btn-small glass" onClick={() => setShowAddModal(true)}>➕</button>
                            </div>
                        </div>
                    </div>

                    <div className="glass card history-card">
                        <h3>📜 Old Bill History</h3>
                        <div className="history-scroll">
                            {history.length > 0 ? history.map(bill => (
                                <div key={bill.id} className="history-item">
                                    <div className="item-header">
                                        <span className="date">{new Date(bill.date).toLocaleDateString()}</span>
                                        <span className="total">₹{bill.finalAmount}</span>
                                    </div>
                                    <div className="item-details">
                                        {bill.items.map((item, i) => (
                                            <div key={i} className="item-line">
                                                {item.name} ({item.quantity} x ₹{item.settledPrice})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : <div className="empty">Select a shop to see history</div>}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: NEW BILLING */}
                <div className="billing-column">
                    <div className="glass card billing-card">
                        <div className="card-header">
                            <h3>📝 Add New Entries {selectedVendorId ? `for ${vendors.find(v => v.id === selectedVendorId)?.shopName}` : ''}</h3>
                            <button type="button" className="btn-small glass" onClick={addItemRow}>➕ Add Item</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="items-container">
                                {billData.items.map((item, index) => (
                                    <div key={index} className="item-input-row">
                                        <div className="input-field">
                                            <label className="simple-label">Item Name</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                required
                                                list="item-suggestions"
                                                placeholder="e.g. Milk"
                                            />
                                        </div>
                                        <div className="input-field narrow">
                                            <label className="simple-label">Qty</label>
                                            <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                                        </div>
                                        <div className="input-field">
                                            <label className="simple-label">Normal Price</label>
                                            <input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
                                        </div>
                                        <div className="input-field">
                                            <label className="simple-label">Final Price</label>
                                            <input type="number" className="highlight-input" value={item.settledPrice} onChange={(e) => updateItem(index, 'settledPrice', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-section">
                                <div className="summary-line">
                                    <span>Pura Paisa:</span>
                                    <span>₹{calculateSubTotal()}</span>
                                </div>
                                <div className="summary-line deduction">
                                    <span>Kam kiya (Correction):</span>
                                    <span>-₹{calculateDeduction()}</span>
                                </div>
                                <div className="summary-line total">
                                    <span>Final Total:</span>
                                    <span>₹{totalAfterDeduction}</span>
                                </div>
                                <hr style={{ opacity: 0.1, margin: '1rem 0' }} />
                                <div className="form-group-horizontal">
                                    <label className="simple-label">Cash Paid Today:</label>
                                    <input type="number" className="highlight-input large" value={billData.paidToday} onChange={(e) => setBillData({ ...billData, paidToday: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="summary-line balance">
                                    <span>Remaining Baki (Due):</span>
                                    <span className={remainingBalance > 0 ? 'text-danger' : 'text-success'}>₹{remainingBalance}</span>
                                </div>
                                <button type="submit" className="btn-primary full-width btn-large" disabled={!selectedVendorId}>✅ Save Bill & Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h3>Register New Shop</h3>
                        <form onSubmit={handleAddVendor}>
                            <div className="form-group">
                                <label>Shop/Vendor Name*</label>
                                <input type="text" required value={newVendor.shopName} onChange={(e) => setNewVendor({ ...newVendor, shopName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" value={newVendor.phone} onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add Shop</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <datalist id="item-suggestions">
                <option value="Milk" />
                <option value="Biscuits" />
                <option value="Eggs" />
            </datalist>

            <style jsx>{`
        .layout-grid {
          display: grid;
          grid-template-columns: minmax(280px, 320px) 1fr;
          gap: 1.5rem;
          min-height: calc(100vh - 120px);
          width: 100%;
        }

        .history-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }

        .history-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .history-scroll {
          flex: 1;
          overflow-y: auto;
          margin-top: 1rem;
          padding-right: 0.5rem;
        }

        .history-item {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          margin-bottom: 0.75rem;
          border-left: 3px solid var(--accent-color);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .item-line {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .select-row {
          display: flex;
          gap: 0.5rem;
        }

        .select-row select { flex: 1; }

        .billing-card {
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .items-container {
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .item-input-row {
          display: grid;
          grid-template-columns: 2fr 0.5fr 1fr 1fr;
          gap: 0.5rem;
          align-items: flex-end;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .input-field label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .highlight-input {
          background: rgba(56, 189, 248, 0.1);
          border-color: var(--accent-color);
          font-weight: 700;
        }

        .summary-section {
          background: rgba(0,0,0,0.2);
          padding: 1.5rem;
          border-radius: var(--radius);
          margin-top: auto;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }

        .summary-line span:last-child {
          text-align: right;
          min-width: 100px;
        }

        .summary-line.deduction { color: var(--danger-color); font-weight: 500; }
        .summary-line.total { font-size: 1.25rem; font-weight: 700; color: var(--accent-color); margin-top: 0.5rem; }
        .summary-line.balance { font-size: 1.1rem; font-weight: 700; margin-top: 1rem; }

        .form-group-horizontal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 0;
        }

        .locked-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 3rem;
          gap: 1rem;
        }

        .lock-icon { font-size: 4rem; }
        .text-danger { color: var(--danger-color); }
        .text-success { color: var(--success-color); }
        .full-width { width: 100%; padding: 1rem; }

        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-content { padding: 2.5rem; width: 400px; border-radius: var(--radius); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }

        @media (max-width: 1200px) {
          .layout-grid { grid-template-columns: 1fr; height: auto; }
          .history-column { height: 350px; }
        }
      `}</style>
        </div>
    )
}

export default UnifiedVendors

import React, { useState, useEffect } from 'react'
import { getDB, addVendor, deleteVendor, updateVendor } from '../utils/db'

function VendorList({ onSelectVendor }) {
    const [vendors, setVendors] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingVendor, setEditingVendor] = useState(null)
    const [newVendor, setNewVendor] = useState({ shopName: '', phone: '', address: '' })

    const loadVendors = () => {
        const db = getDB()
        setVendors(db.vendors)
    }

    useEffect(() => {
        loadVendors()
    }, [])

    const handleAddVendor = (e) => {
        e.preventDefault()
        if (!newVendor.shopName || !newVendor.phone) return
        addVendor(newVendor)
        setShowAddModal(false)
        setNewVendor({ shopName: '', phone: '', address: '' })
        loadVendors()
    }

    const handleDeleteVendor = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? All history for this shop will be lost.`)) {
            deleteVendor(id)
            loadVendors()
        }
    }

    const handleUpdateVendor = (e) => {
        e.preventDefault()
        if (!editingVendor.shopName || !editingVendor.phone) return
        updateVendor(editingVendor.id, editingVendor)
        setEditingVendor(null)
        loadVendors()
    }

    const filteredVendors = vendors.filter(v =>
        v.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm)
    )

    return (
        <div className="vendor-list">
            <div className="list-header">
                <h2>🏪 Shops List</h2>
                <div className="header-actions">
                    <input
                        type="search"
                        placeholder="Search shop name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>➕ Add New Shop</button>
                </div>
            </div>

            <div className="glass table-container desktop-only">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Shop Name</th>
                            <th>Phone</th>
                            <th>Pending Money</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
                            <tr key={vendor.id}>
                                <td>{vendor.shopName}</td>
                                <td>{vendor.phone}</td>
                                <td className={vendor.pendingBalance > 0 ? 'text-danger font-bold' : 'text-success'}>
                                    ₹{vendor.pendingBalance.toLocaleString()}
                                </td>
                                <td>
                                    <div className="action-row">
                                        <button className="btn-small glass" onClick={() => onSelectVendor(vendor.id)}>View</button>
                                        <button className="btn-small glass edit-btn" onClick={() => setEditingVendor(vendor)}>Edit</button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No shops found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="mobile-card-list mobile-only">
                {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
                    <div key={vendor.id} className="mobile-row-card glass animate-fade" onClick={() => onSelectVendor(vendor.id)}>
                        <div className="row-header">
                            <span className="shop-title">🏪 {vendor.shopName}</span>
                            <span className={vendor.pendingBalance > 0 ? 'text-danger' : 'text-success'}>
                                ₹{vendor.pendingBalance.toLocaleString()}
                            </span>
                        </div>
                        <div className="row-details">
                            <span className="text-secondary">📞 {vendor.phone}</span>
                            <span className="text-secondary" style={{ textAlign: 'right' }}>
                                {vendor.pendingBalance > 0 ? 'Debt ⚠️' : 'Paid ✅'}
                            </span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="btn-small glass" onClick={() => onSelectVendor(vendor.id)}>Open</button>
                            <button className="btn-small glass edit-btn" onClick={() => setEditingVendor(vendor)}>Edit</button>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>No shops yet. Add one!</div>
                )}
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass animate-fade">
                        <h3>➕ Add New Shop</h3>
                        <form onSubmit={handleAddVendor}>
                            <div className="form-group">
                                <label>Shop Name*</label>
                                <input
                                    type="text"
                                    required
                                    value={newVendor.shopName}
                                    onChange={(e) => setNewVendor({ ...newVendor, shopName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number*</label>
                                <input
                                    type="text"
                                    required
                                    value={newVendor.phone}
                                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    rows="3"
                                    value={newVendor.address}
                                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingVendor && (
                <div className="modal-overlay">
                    <div className="modal-content glass animate-fade">
                        <h3>Edit Shop Details</h3>
                        <form onSubmit={handleUpdateVendor}>
                            <div className="form-group">
                                <label>Shop Name*</label>
                                <input
                                    type="text"
                                    required
                                    value={editingVendor.shopName}
                                    onChange={(e) => setEditingVendor({ ...editingVendor, shopName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number*</label>
                                <input
                                    type="text"
                                    required
                                    value={editingVendor.phone}
                                    onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    rows="3"
                                    value={editingVendor.address}
                                    onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setEditingVendor(null)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .shop-title {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--glass-border);
        }

        .mobile-row-card {
          cursor: pointer;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          width: 100%;
        }

        @media (max-width: 768px) {
          .header-actions {
            flex-direction: column;
          }
          .search-input {
            max-width: none;
          }
        }
      `}</style>
        </div>
    )
}

export default VendorList

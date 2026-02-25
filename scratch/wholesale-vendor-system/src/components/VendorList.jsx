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
                <h2>Vendors</h2>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search by shop or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Vendor</button>
                </div>
            </div>

            <div className="glass table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Shop Name</th>
                            <th>Phone Number</th>
                            <th>Address</th>
                            <th>Pending Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
                            <tr key={vendor.id}>
                                <td>{vendor.shopName}</td>
                                <td>{vendor.phone}</td>
                                <td className="text-secondary">{vendor.address || 'N/A'}</td>
                                <td className={vendor.pendingBalance > 0 ? 'text-danger font-bold' : 'text-success'}>
                                    ₹{vendor.pendingBalance.toLocaleString()}
                                </td>
                                <td>
                                    <div className="action-row">
                                        <button className="btn-small glass" onClick={() => onSelectVendor(vendor.id)}>View Details</button>
                                        <button className="btn-small glass edit-btn" onClick={() => setEditingVendor(vendor)}>Edit</button>
                                        <button className="btn-small glass delete-btn" onClick={() => handleDeleteVendor(vendor.id, vendor.shopName)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No vendors found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass animate-fade">
                        <h3>Add New Vendor</h3>
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
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          flex: 1;
          justify-content: flex-end;
          min-width: 300px;
        }

        .search-input {
          flex: 1;
          max-width: 400px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th, .data-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .data-table th {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .text-secondary { color: var(--text-secondary); }
        .text-danger { color: var(--danger-color); }
        .text-success { color: var(--success-color); }
        .font-bold { font-weight: 600; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          width: 90%;
          max-width: 500px;
          padding: 2rem;
          border-radius: var(--radius);
        }

        .modal-content h3 {
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .form-group label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .action-row {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn:hover { background: rgba(56, 189, 248, 0.2); border-color: var(--accent-color); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.2); border-color: var(--danger-color); color: var(--danger-color); }

        .btn-secondary {
          background: transparent;
          color: var(--text-primary);
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--glass-border);
        }

        .btn-secondary:hover {
          background: var(--glass-bg);
        }
      `}</style>
        </div>
    )
}

export default VendorList

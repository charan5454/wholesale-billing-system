import React, { useState, useEffect } from 'react'
import { getDB, addProduct, updateProduct, deleteProduct } from '../utils/db'

function ManageProducts() {
    const [products, setProducts] = useState([])
    const [newProduct, setNewProduct] = useState({ name: '', price: 0 })
    const [editingProduct, setEditingProduct] = useState(null)

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = () => {
        const db = getDB()
        setProducts(db.products || [])
    }

    const handleAddProduct = (e) => {
        e.preventDefault()
        if (!newProduct.name || newProduct.price < 0) return
        addProduct({ name: newProduct.name, price: parseFloat(newProduct.price) })
        setNewProduct({ name: '', price: 0 })
        loadProducts()
    }

    const handleUpdateProduct = (e) => {
        e.preventDefault()
        if (!editingProduct.name || editingProduct.price < 0) return
        updateProduct(editingProduct.id, {
            name: editingProduct.name,
            price: parseFloat(editingProduct.price)
        })
        setEditingProduct(null)
        loadProducts()
    }

    const handleDeleteProduct = (id) => {
        if (confirm('Delete this product?')) {
            deleteProduct(id)
            loadProducts()
        }
    }

    const handleVanishZero = (e) => {
        if (e.target.value === '0' || parseFloat(e.target.value) === 0) {
            e.target.value = ''
        }
    }

    const handleRestoreZero = (e, setter, obj, field) => {
        if (e.target.value === '') {
            setter({ ...obj, [field]: 0 })
        }
    }

    return (
        <div className="manage-products-page animate-fade">
            <div className="page-header">
                <h2>Product Inventory</h2>
                <p className="subtitle">Manage items and default pricing for billing</p>
            </div>

            <div className="layout-content">
                <div className="glass section-card add-product-card">
                    <div className="card-header">
                        <div className="icon-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                        </div>
                        <h3>Add New Item</h3>
                    </div>
                    <form onSubmit={handleAddProduct} className="product-form">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Fresh Milk 1L"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Default Price (₹)</label>
                            <div className="price-input-wrapper">
                                <span className="currency-symbol">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.price}
                                    onFocus={handleVanishZero}
                                    onBlur={(e) => handleRestoreZero(e, setNewProduct, newProduct, 'price')}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary full-width">
                            <span>Add to Inventory</span>
                        </button>
                    </form>
                </div>

                <div className="glass section-card list-product-card">
                    <div className="card-header">
                        <div className="icon-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM3 9h18M9 3v18" /></svg>
                        </div>
                        <h3>Current Stock Items</h3>
                    </div>
                    <div className="product-list-container">
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th>Unit Price</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="product-row">
                                        <td>
                                            {editingProduct?.id === p.id ? (
                                                <input
                                                    className="edit-input"
                                                    value={editingProduct.name}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                />
                                            ) : (
                                                <div className="product-info">
                                                    <span className="product-name">{p.name}</span>
                                                    <span className="product-id">ID: {p.id.slice(-6)}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct?.id === p.id ? (
                                                <div className="price-input-wrapper small">
                                                    <span className="currency-symbol">₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editingProduct.price}
                                                        onFocus={handleVanishZero}
                                                        onBlur={(e) => handleRestoreZero(e, setEditingProduct, editingProduct, 'price')}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="price-tag">₹{p.price.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="actions">
                                                {editingProduct?.id === p.id ? (
                                                    <button className="btn-icon save" title="Save Changes" onClick={handleUpdateProduct}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button className="btn-icon edit" title="Edit Item" onClick={() => setEditingProduct(p)}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                        </button>
                                                        <button className="btn-icon delete" title="Delete Item" onClick={() => handleDeleteProduct(p.id)}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="empty-state">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                            <p>No products in inventory</p>
                                            <span>Add items on the left to get started</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .manage-products-page {
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

                .layout-content {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                .section-card {
                    padding: 0;
                    overflow: hidden;
                    border: 1px solid var(--glass-border);
                    background: rgba(30, 41, 59, 0.4);
                    border-radius: var(--radius);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.02);
                }

                .icon-badge {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: var(--accent-glow);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent-color);
                }

                .card-header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0;
                }

                .product-form {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .price-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .currency-symbol {
                    position: absolute;
                    left: 1rem;
                    color: var(--accent-color);
                    font-weight: 600;
                }

                .price-input-wrapper input {
                    padding-left: 2.2rem;
                    width: 100%;
                }

                .price-input-wrapper.small .currency-symbol {
                    left: 0.75rem;
                }

                .price-input-wrapper.small input {
                    padding: 0.5rem 0.5rem 0.5rem 1.8rem;
                    font-size: 0.9rem;
                }

                .full-width {
                    width: 100%;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1rem;
                    letter-spacing: 0.5px;
                }

                .product-list-container {
                    padding: 0;
                    max-height: 600px;
                    overflow-y: auto;
                }

                .product-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .product-table th {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-secondary);
                    background: rgba(0, 0, 0, 0.2);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .product-row {
                    border-bottom: 1px solid var(--glass-border);
                    transition: var(--transition);
                }

                .product-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .product-row td {
                    padding: 1.25rem 1.5rem;
                }

                .product-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .product-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .product-id {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    font-family: monospace;
                }

                .price-tag {
                    font-weight: 700;
                    color: var(--accent-color);
                    background: var(--accent-glow);
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.95rem;
                }

                .actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                }

                .btn-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-secondary);
                    transition: var(--transition);
                    cursor: pointer;
                }

                .btn-icon:hover {
                    transform: scale(1.1);
                    background: rgba(255, 255, 255, 0.1);
                }

                .btn-icon.edit:hover { color: var(--accent-color); }
                .btn-icon.delete:hover { color: var(--danger-color); }
                .btn-icon.save {
                    background: var(--success-color);
                    color: white;
                }

                .edit-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 6px;
                    padding: 0.5rem 0.75rem;
                    width: 100%;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    outline: none;
                    transition: var(--transition);
                }

                .edit-input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--accent-color);
                    box-shadow: 0 0 8px var(--accent-glow);
                }

                .empty-state {
                    text-align: center !important;
                    padding: 5rem 2rem !important;
                    color: var(--text-secondary);
                }

                .empty-state svg {
                    margin-bottom: 1.5rem;
                }

                .empty-state p {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                @media (max-width: 1024px) {
                    .layout-content {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default ManageProducts

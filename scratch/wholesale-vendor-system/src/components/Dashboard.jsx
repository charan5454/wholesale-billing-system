import React, { useState, useEffect } from 'react'
import { getDashboardStats, getDB } from '../utils/db'

function Dashboard({ onSelectVendor }) {
  const [stats, setStats] = useState({ totalSales: 0, totalReceived: 0, totalPending: 0 })
  const [pendingVendors, setPendingVendors] = useState([])

  useEffect(() => {
    setStats(getDashboardStats())
    const db = getDB()
    setPendingVendors(db.vendors.filter(v => v.pendingBalance > 0).sort((a, b) => b.pendingBalance - a.pendingBalance))
  }, [])

  return (
    <div className="dashboard animate-fade">
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-header">
            <span className="icon">🏠</span>
            <span className="label">Total Sale (Today)</span>
          </div>
          <span className="value">₹{(stats.totalSales || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card glass">
          <div className="stat-header">
            <span className="icon">💰</span>
            <span className="label">Cash Received</span>
          </div>
          <span className="value text-success">₹{(stats.totalReceived || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card glass">
          <div className="stat-header">
            <span className="icon">⚠️</span>
            <span className="label">Baki Paisa (Due)</span>
          </div>
          <span className="value text-danger">₹{(stats.totalPending || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="section-title">
        <h2>🏪 Shops with Baki (Due)</h2>
      </div>

      {/* Desktop View */}
      <div className="glass table-container desktop-only">
        <table className="pending-table">
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Phone</th>
              <th>Baki amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingVendors.length > 0 ? pendingVendors.map(vendor => (
              <tr key={vendor.id}>
                <td>{vendor.shopName}</td>
                <td>{vendor.phone}</td>
                <td className="text-danger font-bold">₹{vendor.pendingBalance.toLocaleString()}</td>
                <td>
                  <button className="btn-small glass" onClick={() => onSelectVendor(vendor.id)}>Details</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>All clear! No dues.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="mobile-card-list mobile-only">
        {pendingVendors.length > 0 ? pendingVendors.map(vendor => (
          <div key={vendor.id} className="mobile-row-card glass" onClick={() => onSelectVendor(vendor.id)}>
            <div className="row-header">
              <span className="shop-title">🏪 {vendor.shopName}</span>
              <span className="text-danger">₹{vendor.pendingBalance.toLocaleString()}</span>
            </div>
            <div className="row-details">
              <span className="text-secondary">📞 {vendor.phone}</span>
              <span className="text-secondary" style={{ textAlign: 'right' }}>Baki (Due) ⚠️</span>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>No baki found. All shops have paid! ✅</div>
        )}
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border: 1px solid var(--glass-border);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-header .icon {
          font-size: 1.25rem;
        }

        .label {
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 600;
        }

        .value {
          font-size: 2.2rem;
          font-weight: 800;
        }

        .text-success { color: var(--success-color); }
        .text-danger { color: var(--danger-color); }
        .font-bold { font-weight: 700; }

        .shop-title {
          font-size: 1.1rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .value {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard

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
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card glass">
          <span className="label">Total sales till day</span>
          <span className="value">₹{(stats.totalSales || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card glass">
          <span className="label">Received amount till today</span>
          <span className="value text-success">₹{(stats.totalReceived || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card glass">
          <span className="label">Total pending till today</span>
          <span className="value text-danger">₹{(stats.totalPending || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="section-title">
        <h2>Vendor-wise Pending List</h2>
      </div>

      <div className="glass table-container">
        <table className="pending-table">
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Phone</th>
              <th>Pending Amount</th>
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
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No pending balances</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .value {
          font-size: 2rem;
          font-weight: 700;
        }

        .text-success { color: var(--success-color); }
        .text-danger { color: var(--danger-color); }
        .font-bold { font-weight: 600; }

        .section-title {
          margin-bottom: 1rem;
        }

        .table-container {
          overflow-x: auto;
          border-radius: var(--radius);
        }

        .pending-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .pending-table th, .pending-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .pending-table th {
          font-weight: 600;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
        }

        .btn-small {
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-small:hover {
          background: var(--accent-color);
          color: var(--bg-color);
        }
      `}</style>
    </div>
  )
}

export default Dashboard

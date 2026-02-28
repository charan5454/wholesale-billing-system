import React, { useState, useEffect } from 'react'
import { getDB, addPayment } from '../utils/db'

function VendorDetails({ vendorId, onBack }) {
  const [vendor, setVendor] = useState(null)
  const [history, setHistory] = useState({ bills: [], payments: [] })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [expandedBillId, setExpandedBillId] = useState(null)

  const loadData = () => {
    const db = getDB()
    const v = db.vendors.find(v => v.id === vendorId)
    if (v) {
      setVendor(v)
      setHistory({
        bills: db.bills.filter(b => b.vendorId === vendorId).sort((a, b) => new Date(b.date) - new Date(a.date)),
        payments: db.payments.filter(p => p.vendorId === vendorId).sort((a, b) => new Date(b.date) - new Date(a.date))
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [vendorId])

  const handleAddPayment = (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) return

    addPayment({
      vendorId,
      amount,
      date: new Date(paymentDate).toISOString(),
      note: 'Manual Payment Entry'
    })

    setPaymentAmount('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setShowPaymentModal(false)
    loadData()
  }

  const handlePrint = () => {
    const originalTitle = document.title;
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `Statement_${vendor.shopName.replace(/\s+/g, '_')}_${timestamp}`;

    document.title = filename;
    window.print();
    // Use a slight delay or wait for focus to restore title, 
    // though for most browsers once the print dialog closes, execution continues.
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (!vendor) return <div>Loading...</div>

  return (
    <div className="vendor-details animate-fade">
      <div className="details-header">
        <button className="btn-small glass" onClick={onBack}>⬅️ Back</button>
        <div className="header-info">
          <h2>🏪 {vendor.shopName}</h2>
          <p className="text-secondary">📞 {vendor.phone} | 📍 {vendor.address}</p>
          <div className="header-actions">
            <button className="btn-small glass" onClick={handlePrint}>🖨️ Get Report</button>
            <button className="btn-primary" onClick={() => setShowPaymentModal(true)}>💰 Deposit Jama</button>
          </div>
        </div>
      </div>

      <div className="balance-banner glass animate-fade">
        <span className="label">Total Baki (Remaining Due)</span>
        <span className={`value ${vendor.pendingBalance > 0 ? 'text-danger' : 'text-success'}`}>
          ₹{vendor.pendingBalance.toLocaleString()}
        </span>
      </div>

      <div className="history-grid">
        <div className="history-section glass">
          <h3>📝 Purchase History</h3>
          <div className="history-list">
            {history.bills.length > 0 ? history.bills.map(bill => (
              <div
                key={bill.id}
                className={`history-item bill-item ${expandedBillId === bill.id ? 'expanded' : ''}`}
                onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
              >
                <div className="item-main">
                  <span className="id">Bill #{bill.id.slice(-4)}</span>
                  <span className="date">📅 {new Date(bill.date).toLocaleDateString()}</span>
                </div>
                <div className="item-stats">
                  <span className="total">Total: ₹{bill.finalAmount.toLocaleString()}</span>
                  <span className="paid text-success">Paid: ₹{bill.paidToday.toLocaleString()}</span>
                </div>
                {expandedBillId === bill.id && (
                  <div className="bill-items-details animate-fade">
                    <hr style={{ opacity: 0.1, margin: '1rem 0' }} />
                    <h4>Items Bought:</h4>
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.settledPrice || item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )) : <p className="empty-msg">No purchase history</p>}
          </div>
        </div>

        <div className="history-section glass">
          <h3>💵 Payments Received (Jama)</h3>
          <div className="history-list">
            {history.payments.length > 0 ? history.payments.map(payment => (
              <div key={payment.id} className="history-item">
                <div className="item-main">
                  <span className="id">Pay #{payment.id.slice(-4)}</span>
                  <span className="date">📅 {new Date(payment.date).toLocaleDateString()}</span>
                </div>
                <div className="item-stats">
                  <span className="amount text-success">+₹{payment.amount.toLocaleString()}</span>
                  <span className="note">{payment.note}</span>
                </div>
              </div>
            )) : <p className="empty-msg">No payment history</p>}
          </div>
        </div>
      </div>

      {/* Hidden Printable Statement */}
      <div id="printable-statement" className="print-only">
        <div className="invoice-header">
          <h1>STATEMENT OF ACCOUNT</h1>
          <div className="invoice-meta">
            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            <div><strong>Vendor ID:</strong> {vendor.id}</div>
          </div>
        </div>

        <div className="invoice-info">
          <div className="vendor-details-print">
            <h3>Statement For:</h3>
            <div className="shop-name">{vendor.shopName}</div>
            <div className="phone">{vendor.phone}</div>
            <div className="address">{vendor.address}</div>
          </div>
        </div>

        <div className="statement-balance-banner">
          <div className="balance-label">CURRENT PENDING BALANCE</div>
          <div className="balance-value">₹{vendor.pendingBalance.toLocaleString()}</div>
        </div>

        <div className="statement-section">
          <h2>Transaction Ledger</h2>
          <table className="statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Debit (Bills)</th>
                <th style={{ textAlign: 'right' }}>Credit (Paid)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ...history.bills.map(b => ({ ...b, type: 'bill' })),
                ...history.payments.map(p => ({ ...p, type: 'payment' }))
              ].sort((a, b) => new Date(b.date) - new Date(a.date)).map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.type === 'bill' ? (
                    <>
                      <tr className="bill-header-row">
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td><strong>Purchase: {item.id}</strong></td>
                        <td style={{ textAlign: 'right' }}>₹{item.finalAmount.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.paidToday.toLocaleString()}</td>
                      </tr>
                      <tr className="bill-items-row">
                        <td colSpan="4">
                          <div className="items-list-print">
                            <table className="print-bill-items">
                              <thead>
                                <tr>
                                  <th>Item Name</th>
                                  <th style={{ textAlign: 'center' }}>Qty</th>
                                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                                  <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.items.map((i, k) => (
                                  <tr key={k}>
                                    <td>{i.name}</td>
                                    <td style={{ textAlign: 'center' }}>{i.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>₹{(i.settledPrice || i.price).toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }}>₹{(i.quantity * (i.settledPrice || i.price)).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr className="payment-row">
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td><em>Direct Payment: {item.note || 'Manual Entry'}</em></td>
                      <td style={{ textAlign: 'right' }}>-</td>
                      <td style={{ textAlign: 'right' }} className="text-success">+₹{item.amount.toLocaleString()}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-sign">
          <div className="sign-box">
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade">
            <h3>Record Future Payment</h3>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>This will reduce the pending balance for {vendor.shopName}.</p>
            <form onSubmit={handleAddPayment}>
              <div className="form-group">
                <label>Date of Repayment*</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Payment Amount (₹)*</label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .details-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .header-info h2 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .balance-banner {
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .balance-banner .label {
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .balance-banner .value {
          font-size: 3rem;
          font-weight: 800;
        }

        .history-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .history-section {
          padding: 1.5rem;
          min-height: 400px;
        }

        .history-section h3 {
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius);
          border: 1px solid var(--glass-border);
          transition: var(--transition);
        }

        .bill-item {
          cursor: pointer;
        }

        .bill-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--accent-color);
        }

        .bill-item.expanded {
          border-color: var(--accent-color);
          box-shadow: 0 0 10px var(--accent-glow);
        }

        .bill-items-details {
          margin-top: 1rem;
          padding-top: 0.5rem;
        }

        .bill-items-details h4 {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: var(--accent-color);
        }

        .mini-table {
          width: 100%;
          font-size: 0.85rem;
          border-collapse: collapse;
        }

        .mini-table th {
          text-align: left;
          color: var(--text-secondary);
          font-weight: 500;
          padding-bottom: 0.25rem;
        }

        .mini-table td {
          padding: 0.25rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .item-main {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .item-main .id {
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--accent-color);
        }

        .item-main .date {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .item-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
        }

        .item-stats .note {
          font-style: italic;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .empty-msg {
          text-align: center;
          color: var(--text-secondary);
          padding: 3rem 0;
        }

        .text-success { color: var(--success-color); }
        .text-danger { color: var(--danger-color); }

        /* Repeated Styles for Modal (matching VendorList) */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex; justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-content { width: 90%; max-width: 400px; padding: 2rem; border-radius: var(--radius); }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
        .form-group label { font-size: 0.875rem; color: var(--text-secondary); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        .btn-secondary { background: transparent; color: var(--text-primary); padding: 0.75rem 1.5rem; border: 1px solid var(--glass-border); }

        @media (max-width: 900px) {
          .history-grid { grid-template-columns: 1fr; }
        }

        @media print {
          .glass { background: white !important; color: black !important; border: 1px solid #ccc !important; box-shadow: none !important; }
          .btn-small, .btn-primary, .details-header button { display: none !important; }
          .app-container { display: block !important; padding: 0 !important; }
          .sidebar, .top-bar { display: none !important; }
          .main-content { margin-left: 0 !important; width: 100% !important; padding: 0 !important; }
          .vendor-details { padding: 0 !important; color: black !important; }
          .balance-banner { border: 2px solid black !important; margin-bottom: 2rem !important; }
          .history-grid { display: block !important; }
          .history-section { min-height: auto !important; margin-bottom: 2rem !important; page-break-inside: avoid; }
          .bill-items-details { display: block !important; }
          .mini-table td, .mini-table th { color: black !important; border-bottom: 1px solid #eee !important; }
          h2, h3, h4, .total, .paid, .amount { color: black !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}

export default VendorDetails

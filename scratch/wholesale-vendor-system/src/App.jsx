import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import VendorList from './components/VendorList'
import VendorDetails from './components/VendorDetails'
import Billing from './components/Billing'
import ManageProducts from './components/ManageProducts'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [viewingVendorId, setViewingVendorId] = useState(null)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onSelectVendor={(id) => { setViewingVendorId(id); setActiveTab('shops') }} />
      case 'shops':
        return viewingVendorId ? (
          <VendorDetails vendorId={viewingVendorId} onBack={() => setViewingVendorId(null)} />
        ) : (
          <VendorList onSelectVendor={(id) => setViewingVendorId(id)} />
        )
      case 'billing':
        return <Billing />
      case 'manage-products':
        return <ManageProducts />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar - Desktop Only */}
      <nav className="glass sidebar desktop-only">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 11.5C7 11.5 7.5 7.5 8 5H16C16.5 7.5 17 11.5 17 11.5V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 2H14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 2L10 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2L14 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 14H17" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d="M9 17C9.55228 17 10 17.4477 10 18C10 18.5523 9.55228 19 9 19C8.44772 19 8 18.5523 8 18C8 17.4477 8.44772 17 9 17Z" fill="white" fillOpacity="0.5" />
          </svg>
          <h1>Dairy</h1>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setViewingVendorId(null) }}>
            <span>🏠 Home</span>
          </li>
          <li className={activeTab === 'shops' ? 'active' : ''} onClick={() => { setActiveTab('shops'); setViewingVendorId(null) }}>
            <span>🏪 Shops</span>
          </li>
          <li className={activeTab === 'billing' ? 'active' : ''} onClick={() => { setActiveTab('billing'); setViewingVendorId(null) }}>
            <span>📝 New Bill</span>
          </li>
          <li className={activeTab === 'manage-products' ? 'active' : ''} onClick={() => { setActiveTab('manage-products'); setViewingVendorId(null) }}>
            <span>📦 Items</span>
          </li>
        </ul>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="bottom-nav mobile-only">
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setViewingVendorId(null) }}>
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </div>
        <div className={`nav-item ${activeTab === 'shops' ? 'active' : ''}`} onClick={() => { setActiveTab('shops'); setViewingVendorId(null) }}>
          <span className="nav-icon">🏪</span>
          <span>Shops</span>
        </div>
        <div className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => { setActiveTab('billing'); setViewingVendorId(null) }}>
          <span className="nav-icon">📝</span>
          <span>Bill</span>
        </div>
        <div className={`nav-item ${activeTab === 'manage-products' ? 'active' : ''}`} onClick={() => { setActiveTab('manage-products'); setViewingVendorId(null) }}>
          <span className="nav-icon">📦</span>
          <span>Items</span>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-bar">
          <div className="date desktop-only">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="mobile-only logo-small">
            <h1>🥛 Dairy</h1>
          </div>
          <div className="user-profile glass">
            Admin
          </div>
        </header>
        <div className="content-area animate-fade">
          {renderContent()}
        </div>
        {/* Padding for mobile nav */}
        <div className="mobile-only" style={{ height: '80px' }}></div>
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 220px;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          border-right: 1px solid var(--glass-border);
          position: fixed;
          height: 100vh;
          z-index: 100;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -1px;
          margin: 0;
        }

        .nav-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .nav-links li {
          padding: 1rem;
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-secondary);
          font-size: 1.1rem;
          display: flex;
          align-items: center;
        }

        .nav-links li:hover {
          background: var(--glass-bg);
          color: var(--text-primary);
        }

        .nav-links li.active {
          background: var(--accent-color);
          color: var(--bg-color);
          font-weight: 600;
          box-shadow: 0 0 15px var(--accent-glow);
        }

        .main-content {
          flex: 1;
          margin-left: 220px;
          padding: 2rem;
          width: calc(100% - 220px);
        }

        .logo-small h1 {
          font-size: 1.5rem;
          margin: 0;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .user-profile {
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding: 1rem;
            width: 100%;
          }
          
          .top-bar {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default App

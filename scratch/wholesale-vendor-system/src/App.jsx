import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import VendorList from './components/VendorList'
import VendorDetails from './components/VendorDetails'
import UnifiedVendors from './components/UnifiedVendors'
import ManageProducts from './components/ManageProducts'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [viewingVendorId, setViewingVendorId] = useState(null)
  const [showAllMobile, setShowAllMobile] = useState(false)

  const handleSelectVendor = (id) => {
    setViewingVendorId(id)
    if (window.innerWidth > 768) {
      setActiveTab('vendors')
    } else {
      // Safe to stay on current view or scroll down
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onSelectVendor={handleSelectVendor} />
      case 'vendors':
        return viewingVendorId ? (
          <VendorDetails vendorId={viewingVendorId} onBack={() => setViewingVendorId(null)} />
        ) : (
          <VendorList onSelectVendor={handleSelectVendor} />
        )
      case 'billing':
        return <UnifiedVendors />
      case 'products':
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
            <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 22V17C10 15.8954 10.8954 15 12 15C13.1046 15 14 15.8954 14 17V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="logo-text">Dairy Pro</span>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setViewingVendorId(null) }}>
            <span className="icon">🏠</span> Home
          </li>
          <li className={activeTab === 'vendors' ? 'active' : ''} onClick={() => { setActiveTab('vendors'); setViewingVendorId(null) }}>
            <span className="icon">🏪</span> Shops List
          </li>
          <li className={activeTab === 'billing' ? 'active' : ''} onClick={() => { setActiveTab('billing'); setViewingVendorId(null) }}>
            <span className="icon">📝</span> New Bill
          </li>
          <li className={activeTab === 'products' ? 'active' : ''} onClick={() => { setActiveTab('products'); setViewingVendorId(null) }}>
            <span className="icon">📦</span> Items List
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {/* Top Bar - Desktop Only */}
        <header className="top-bar desktop-only">
          <div className="date-display">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="user-profile glass">Jatin</div>
        </header>

        {/* content area */}
        <div className="content-area">

          {/* MOBILE VIEW */}
          <div className="mobile-only mobile-focus-content">
            <div className="sticky-header glass mobile-only">
              <h3>📝 Generate Bill</h3>
            </div>

            <section className="billing-section">
              <UnifiedVendors />
            </section>

            <div className="toggle-container">
              <button
                className="btn-large glass toggle-btn animate-fade"
                onClick={() => setShowAllMobile(!showAllMobile)}
              >
                {showAllMobile ? "⬆️ Hide Other Sections" : "⏬ Show More Options"}
              </button>
            </div>

            {showAllMobile && (
              <div className="extra-sections animate-slide-down">
                <div className="mobile-card-section">
                  <h3 className="section-title">🏠 Home Overview</h3>
                  <Dashboard onSelectVendor={handleSelectVendor} />
                </div>
                <div className="mobile-card-section">
                  <h3 className="section-title">🏪 Shops List</h3>
                  {viewingVendorId ? (
                    <VendorDetails vendorId={viewingVendorId} onBack={() => setViewingVendorId(null)} />
                  ) : (
                    <VendorList onSelectVendor={handleSelectVendor} />
                  )}
                </div>
                <div className="mobile-card-section">
                  <h3 className="section-title">📦 Items & Prices</h3>
                  <ManageProducts />
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP VIEW */}
          <div className="desktop-only">
            {renderContent()}
          </div>

        </div>
      </main>

      <style jsx>{`
        .app-container { display: flex; min-height: 100vh; }
        .sidebar { width: 220px; padding: 2rem 1rem; position: fixed; height: 100vh; z-index: 100; border-right: 1px solid var(--glass-border); }
        .logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
        .logo-text { font-size: 1.25rem; font-weight: 700; color: white; }
        .nav-links { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
        .nav-links li { padding: 1rem; border-radius: var(--radius); cursor: pointer; transition: all 0.3s; color: var(--text-secondary); display: flex; align-items: center; gap: 0.75rem; }
        .nav-links li.active { background: var(--accent-color); color: var(--bg-color); font-weight: 700; box-shadow: 0 0 15px var(--accent-glow); }
        .main-content { flex: 1; margin-left: 220px; padding: 2rem; width: calc(100% - 220px); }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        
        /* Mobile Specific Styles */
        .mobile-focus-content { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 5rem; }
        .sticky-header { position: sticky; top: 0; z-index: 50; padding: 1rem; border-radius: 0 0 var(--radius) var(--radius); text-align: center; margin: -1rem -1rem 1rem -1rem; backdrop-filter: blur(20px); }
        .toggle-container { padding: 1rem 0; display: flex; justify-content: center; }
        .toggle-btn { width: 100%; max-width: 400px; padding: 1.25rem; font-size: 1.1rem; border: 1px solid var(--accent-color); background: var(--accent-glow); }
        .mobile-card-section { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--glass-border); }
        .section-title { margin-bottom: 1rem; color: var(--accent-color); font-size: 1.2rem; }
        
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 1rem; width: 100%; }
          .content-area { padding-bottom: 2rem; }
        }
      `}</style>
    </div>
  )
}

export default App

import React from 'react';
import { LayoutDashboard, ShoppingBag, Truck, AlertCircle, Store, HelpCircle, LogOut } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen, onOpenStoreSelector }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'deliveries', label: 'Deliveries', icon: Truck },
    { id: 'issues', label: 'Issues', icon: AlertCircle },
  ];

  const handleNavClick = (id) => {
    setCurrentTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      <div className={`mobile-overlay ${mobileOpen ? 'mobile-open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <h1 className="brand-title">WAYPOINT</h1>
            <p className="brand-subtitle">Store Manager Portal</p>
          </div>

          <nav>
            <ul className="sidebar-menu">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                      style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isActive ? '#3B82F6' : '#64748B', marginRight: '10px' }} />
                      </span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button 
            className="sidebar-item" 
            onClick={onOpenStoreSelector}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
          >
            <Store size={18} />
            Store Profile
          </button>
          <button 
            className="sidebar-item" 
            onClick={() => alert('Waypoint Support Desk: Dial 1919 or email support@waypoint.lk')}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
          >
            <HelpCircle size={18} />
            Help
          </button>
          <button 
            className="sidebar-item" 
            onClick={() => alert('Logged out of Waypoint Portal.')}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

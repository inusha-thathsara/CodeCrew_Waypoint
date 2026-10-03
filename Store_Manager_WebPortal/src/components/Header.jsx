import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';

export default function Header({ currentStore, onOpenStoreSelector, setMobileOpen }) {
  const getBrandBadgeClass = (brandName) => {
    if (brandName.includes('Fresh')) return 'badge-brand-fresh';
    if (brandName.includes('Style')) return 'badge-brand-style';
    if (brandName.includes('Tech')) return 'badge-brand-tech';
    return 'badge-brand-fresh';
  };

  return (
    <header className="top-header">
      <div className="header-store-info">
        <button 
          className="mobile-nav-toggle" 
          onClick={() => setMobileOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={24} />
        </button>

        <div 
          onClick={onOpenStoreSelector} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="Click to switch store outlet"
        >
          <h2 className="store-title">{currentStore.name || 'OUT076 : Kandy Fresh'}</h2>
          <span className={`badge ${getBrandBadgeClass(currentStore.brand || 'Waypoint Fresh')}`}>
            {currentStore.brand || 'Waypoint Fresh'}
          </span>
          <ChevronDown size={16} color="#64748B" />
        </div>
      </div>

      <div className="header-user">
        <div className="user-avatar">
          SM
        </div>
        <div className="user-details">
          <span className="user-role">Store Manager</span>
          <span className="user-store">{currentStore.name || 'OUT076 : Kandy Fresh'}</span>
        </div>
      </div>
    </header>
  );
}

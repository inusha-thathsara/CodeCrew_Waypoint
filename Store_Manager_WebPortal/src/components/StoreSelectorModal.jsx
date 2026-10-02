import React, { useState } from 'react';
import { Search, X, MapPin, Clock } from 'lucide-react';

export default function StoreSelectorModal({ outlets, currentStore, onSelectStore, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');

  const filteredOutlets = outlets.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.outlet_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === 'All' || o.brand.includes(brandFilter);
    return matchesSearch && matchesBrand;
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '640px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Select Waypoint Store Outlet</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Switch store profile across 120 Waypoint Fresh, Style, & Tech outlets
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Outlet ID (OUT001), District (Kandy), or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', backgroundColor: '#FFFFFF' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Fresh', 'Style', 'Tech'].map((b) => (
              <button
                key={b}
                className={`pill-option ${brandFilter === b ? 'active' : ''}`}
                onClick={() => setBrandFilter(b)}
                style={{ padding: '4px 12px', fontSize: '12px' }}
              >
                {b === 'All' ? 'All Brands' : `Waypoint ${b}`}
              </button>
            ))}
          </div>
        </div>

        {/* Store List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredOutlets.map((outlet) => {
              const isSelected = currentStore.outlet_id === outlet.outlet_id;
              return (
                <div
                  key={outlet.outlet_id}
                  onClick={() => {
                    onSelectStore(outlet);
                    onClose();
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>{outlet.name}</span>
                      <span className={`badge ${
                        outlet.brand.includes('Fresh') ? 'badge-brand-fresh' : 
                        outlet.brand.includes('Style') ? 'badge-brand-style' : 'badge-brand-tech'
                      }`}>
                        {outlet.brand}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {outlet.district} ({outlet.depot} Hub)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Window: {outlet.delivery_window}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span style={{ color: '#2563EB', fontWeight: '700', fontSize: '13px' }}>Active</span>
                  )}
                </div>
              );
            })}

            {filteredOutlets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                No outlets matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

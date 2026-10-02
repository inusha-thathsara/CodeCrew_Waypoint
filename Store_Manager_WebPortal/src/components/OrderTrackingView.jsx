import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export default function OrderTrackingView({ order, currentStore, onNavigateToReceive, onNavigateToDeferredView }) {
  const activeOrder = order || {
    id: 'WF-1042',
    outlet_id: 'OUT076',
    status: 'On the way',
    vehicle: 'VEH039',
    driver: 'Kasun',
    eta: '7:12 AM',
    loading_issue: 'Milk: planned 18, available 15 — 3 units unavailable at loading.'
  };

  const steps = [
    { label: 'Confirmed', state: 'completed' },
    { label: 'Planned', state: 'completed' },
    { label: 'Loaded', state: 'completed' },
    { label: 'Departed', state: 'completed' },
    { label: 'On the way', state: 'active' },
    { label: 'Delivered', state: 'upcoming' },
  ];

  return (
    <div className="content-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Delivery Tracking</h1>
          <p className="page-subtitle">Order {activeOrder.id} · {currentStore.name || 'OUT076 : Kandy Fresh'}</p>
        </div>

        <button className="btn btn-primary" onClick={() => onNavigateToReceive(activeOrder)}>
          Receive Delivery
        </button>
      </div>

      {/* Main Delivery Tracking Card */}
      <div className="card" style={{ padding: '32px 24px 24px 24px' }}>
        {/* Metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div>
            <div className="form-label">Status</div>
            <div style={{ marginTop: '4px' }}>
              <span className="badge badge-on-the-way">
                {activeOrder.status || 'On the way'}
              </span>
            </div>
          </div>

          <div>
            <div className="form-label">Vehicle</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
              {activeOrder.vehicle || 'VEH039'}
            </div>
          </div>

          <div>
            <div className="form-label">Driver</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
              {activeOrder.driver || 'Kasun'}
            </div>
          </div>

          <div>
            <div className="form-label">ETA</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
              {activeOrder.eta || '7:12 AM'}
            </div>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="step-tracker">
          <div className="step-tracker-line" />
          <div className="step-tracker-progress" style={{ width: '80%' }} />

          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`step-item ${step.state === 'completed' ? 'completed' : step.state === 'active' ? 'active' : ''}`}
            >
              <div className="step-icon">
                {step.state === 'completed' ? (
                  <Check size={16} strokeWidth={3} />
                ) : step.state === 'active' ? (
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                ) : null}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading issue recorded Banner */}
      <div className="banner-warning" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
          <AlertTriangle size={18} />
          Loading issue recorded
        </div>
        <div style={{ fontSize: '14px', paddingLeft: '26px' }}>
          {activeOrder.loading_issue || 'Milk: planned 18, available 15 — 3 units unavailable at loading.'}
        </div>
      </div>

      {/* Delivery Deferred Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
          Delivery Deferred - Order WF-1031
        </h3>

        <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>
          Reason: Vehicle capacity issue
        </div>

        <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
          <div>
            <div className="form-label">Original Delivery</div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>28 September</div>
          </div>

          <div>
            <div className="form-label">Next Planned Delivery</div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>29 September</div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onNavigateToDeferredView}>
          View
        </button>
      </div>
    </div>
  );
}

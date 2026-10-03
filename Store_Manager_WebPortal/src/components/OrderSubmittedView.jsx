import React from 'react';
import { Check } from 'lucide-react';

export default function OrderSubmittedView({ orderId, onViewOrder }) {
  const currentOrderId = orderId || 'WF-1043';

  return (
    <div className="content-body" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '460px',
        width: '100%',
        padding: '32px'
      }}>
        {/* Green Checkmark Icon Circle */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#DCFCE7',
          color: '#16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Check size={32} strokeWidth={3} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
          Order submitted successfully
        </h2>

        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
          Order {currentOrderId} has been submitted for dispatch planning.
        </p>

        <button className="btn btn-primary" onClick={onViewOrder}>
          View Order
        </button>
      </div>
    </div>
  );
}

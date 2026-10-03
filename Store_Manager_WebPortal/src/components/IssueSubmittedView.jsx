import React from 'react';
import { Check } from 'lucide-react';

export default function IssueSubmittedView({ issue, onViewDashboard }) {
  const issueId = issue?.issue_id || 'ISS-1031';
  const orderId = issue?.order_id || 'WF-1043';

  return (
    <div className="content-body" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <div className="card" style={{
        textAlign: 'center',
        maxWidth: '440px',
        width: '100%',
        padding: '40px 32px'
      }}>
        {/* Green Checkmark Circle */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#DCFCE7',
          color: '#16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Check size={28} strokeWidth={3} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
          Issue submitted
        </h2>

        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: '1.5' }}>
          We have logged your report for Order {orderId} and the logistics team will follow up.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '28px'
        }}>
          <div>
            <div className="form-label" style={{ fontSize: '10px' }}>ISSUE ID</div>
            <div style={{ fontSize: '16px', fontWeight: '800' }}>{issueId}</div>
          </div>

          <div>
            <div className="form-label" style={{ fontSize: '10px' }}>STATUS</div>
            <span className="badge badge-under-review">
              Under Review
            </span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onViewDashboard}>
          View Dashboard
        </button>
      </div>
    </div>
  );
}

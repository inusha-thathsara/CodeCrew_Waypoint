import React, { useState } from 'react';
import { Upload } from 'lucide-react';

export default function ReportIssueView({ issueContext, currentStore, onSubmitIssue, onCancel }) {
  const orderId = issueContext?.order_id || 'WF-1043';
  const storeName = currentStore?.name || 'OUT076 : Kandy Fresh';
  const vehicle = issueContext?.vehicle || 'VEH057';

  const [issueType, setIssueType] = useState('Quantity mismatch');
  const [product, setProduct] = useState(issueContext?.product || 'Milk');
  const [expectedQty, setExpectedQty] = useState(issueContext?.expected || 18);
  const [receivedQty, setReceivedQty] = useState(issueContext?.received || 15);
  const [description, setDescription] = useState('3 units of milk were missing from the delivery (received 15 of 18).');
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const issueTypes = [
    'Quantity mismatch',
    'Damaged item',
    'Wrong item',
    'Missing item',
    'Other'
  ];

  const handleSubmit = () => {
    const newIssue = {
      issue_id: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
      order_id: orderId,
      store_id: storeName,
      vehicle: vehicle,
      delivered_summary: `${receivedQty} of ${expectedQty} units`,
      issue_type: issueType,
      product: product,
      expected_qty: expectedQty,
      received_qty: receivedQty,
      description: description,
      status: 'Under Review',
      created_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    onSubmitIssue(newIssue);
  };

  return (
    <div className="content-body">
      <div className="page-header">
        <h1 className="page-title">Report Delivery Issue</h1>
        <p className="page-subtitle">Order {orderId} {storeName}</p>
      </div>

      {/* Summary Card Strip */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <div>
            <span style={{ color: '#64748B' }}>Order ID </span>
            <strong style={{ color: '#0F172A' }}>{orderId}</strong>
          </div>

          <div>
            <span style={{ color: '#64748B' }}>Store </span>
            <strong style={{ color: '#0F172A' }}>{storeName}</strong>
          </div>

          <div>
            <span style={{ color: '#64748B' }}>Vehicle </span>
            <strong style={{ color: '#0F172A' }}>{vehicle}</strong>
          </div>

          <div>
            <span style={{ color: '#64748B' }}>Delivered </span>
            <strong style={{ color: '#0F172A' }}>37 of 40 units</strong>
          </div>
        </div>
      </div>

      {/* Issue Type Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Issue Type</h3>

        <div className="pill-group">
          {issueTypes.map((type) => (
            <button
              key={type}
              className={`pill-option ${issueType === type ? 'active' : ''}`}
              onClick={() => setIssueType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Product & Qty Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
          <div className="form-label">PRODUCT</div>
          <input
            type="text"
            className="form-control"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            style={{ fontWeight: '700', backgroundColor: '#FFFFFF' }}
          />
        </div>

        <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
          <div className="form-label">EXPECTED QUANTITY</div>
          <input
            type="number"
            className="form-control"
            value={expectedQty}
            onChange={(e) => setExpectedQty(parseInt(e.target.value) || 0)}
            style={{ fontWeight: '700', backgroundColor: '#FFFFFF' }}
          />
        </div>

        <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
          <div className="form-label">RECEIVED QUANTITY</div>
          <input
            type="number"
            className="form-control"
            value={receivedQty}
            onChange={(e) => setReceivedQty(parseInt(e.target.value) || 0)}
            style={{ fontWeight: '700', backgroundColor: '#FFFFFF' }}
          />
        </div>
      </div>

      {/* Description Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Description</h3>

        <textarea
          className="form-control"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          style={{ backgroundColor: '#FFFFFF', padding: '14px', resize: 'vertical' }}
        />
      </div>

      {/* Upload Photo Section */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setPhotoUploaded(!photoUploaded)}
          style={{
            border: '2px dashed #CBD5E1',
            borderRadius: '8px',
            padding: '12px 20px',
            backgroundColor: photoUploaded ? '#EFF6FF' : '#FFFFFF',
            color: photoUploaded ? '#2563EB' : '#475569',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Upload size={16} />
          {photoUploaded ? 'Photo Uploaded ✓' : '+ Upload Photo'}
        </button>
        <span style={{ fontSize: '13px', color: '#94A3B8' }}>Optional</span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit Issue
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

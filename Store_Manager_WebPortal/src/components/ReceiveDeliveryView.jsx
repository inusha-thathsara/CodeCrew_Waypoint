import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ReceiveDeliveryView({ order, onConfirmDelivery, onReportIssue }) {
  const activeOrder = order || {
    id: 'WF-1042',
    vehicle_code: 'RF-07',
    vehicle: 'VEH039',
    items: [
      { product: 'Milk', expected: 18, received: 15, status: 'Short by 3' },
      { product: 'Yogurt', expected: 10, received: 10, status: 'OK' },
      { product: 'Vegetables', expected: 8, received: 8, status: 'OK' },
      { product: 'Frozen Chicken', expected: 4, received: 4, status: 'OK' }
    ]
  };

  const [items, setItems] = useState(
    activeOrder.items || [
      { product: 'Milk', expected: 18, received: 15, status: 'Short by 3' },
      { product: 'Yogurt', expected: 10, received: 10, status: 'OK' },
      { product: 'Vegetables', expected: 8, received: 8, status: 'OK' },
      { product: 'Frozen Chicken', expected: 4, received: 4, status: 'OK' }
    ]
  );

  const handleQtyChange = (idx, val) => {
    const r = Math.max(0, parseInt(val) || 0);
    setItems(items.map((item, i) => {
      if (i === idx) {
        const diff = item.expected - r;
        const status = diff === 0 ? 'OK' : diff > 0 ? `Short by ${diff}` : `Extra by ${-diff}`;
        return { ...item, received: r, status };
      }
      return item;
    }));
  };

  const handleConfirm = () => {
    onConfirmDelivery({ ...activeOrder, items });
  };

  const handleReportIssueClick = () => {
    const shortItem = items.find(i => i.status.includes('Short') || i.received < i.expected) || items[0];
    onReportIssue({
      order_id: activeOrder.id,
      vehicle: activeOrder.vehicle || activeOrder.vehicle_code || 'VEH057',
      product: shortItem?.product || 'Milk',
      expected: shortItem?.expected || 18,
      received: shortItem?.received || 15,
      items
    });
  };

  return (
    <div className="content-body">
      <div className="page-header">
        <h1 className="page-title">Receive Delivery</h1>
        <p className="page-subtitle">Order {activeOrder.id} · Vehicle {activeOrder.vehicle_code || activeOrder.vehicle || 'RF-07'}</p>
      </div>

      {/* Confirmation Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Expected</th>
                <th>Recieved</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600' }}>{item.product}</td>
                  <td>{item.expected}</td>
                  <td style={{ width: '110px' }}>
                    <input
                      type="number"
                      className="form-control"
                      value={item.received}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      style={{ textAlign: 'center', fontWeight: '600' }}
                    />
                  </td>
                  <td style={{ color: item.status === 'OK' ? '#16A34A' : '#D97706', fontWeight: '600' }}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Box */}
      <div className="banner-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={18} />
        <span>Milk short by 3 units (loading issue recorded)</span>
      </div>

      {/* Action Buttons matching screenshot rounded buttons */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleConfirm}
          style={{ borderRadius: '9999px', padding: '12px 32px' }}
        >
          Confirm
        </button>
        <button 
          className="btn btn-danger-outline" 
          onClick={handleReportIssueClick}
          style={{ borderRadius: '9999px', padding: '12px 32px' }}
        >
          Report Issue
        </button>
      </div>
    </div>
  );
}

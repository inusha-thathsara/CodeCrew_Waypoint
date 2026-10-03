import React from 'react';

export default function ReviewOrderView({ draftOrder, onConfirmOrder, onEditOrder }) {
  const orderId = draftOrder?.id || 'WF-1043';
  const storeName = draftOrder?.store_name || 'OUT002 : Kandy Fresh';
  const requestedDelivery = draftOrder?.requested_delivery_date ? '26 September' : '26 September';
  const deliveryWindow = draftOrder?.delivery_window || '5.30AM-8.00AM';
  const items = draftOrder?.items || [
    { product: 'Milk', quantity: 18 },
    { product: 'Yogurt', quantity: 10 },
    { product: 'Vegetables', quantity: 8 },
    { product: 'Chilled Chicken', quantity: 4 }
  ];

  return (
    <div className="content-body">
      <div className="page-header">
        <h1 className="page-title">Review Order</h1>
        <p className="page-subtitle">Check your order details before submitting.</p>
      </div>

      {/* Order Summary Strip Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
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
            <span style={{ color: '#64748B' }}>Requested Delivery </span>
            <strong style={{ color: '#0F172A' }}>{requestedDelivery}</strong>
          </div>

          <div>
            <span style={{ color: '#64748B' }}>Delivery Window </span>
            <strong style={{ color: '#0F172A' }}>{deliveryWindow}</strong>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Order Items</h3>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>QUANTITY</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{item.product}</td>
                    <td style={{ color: '#475569' }}>{item.quantity} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Alert Box */}
      <div className="banner-info">
        <span style={{ fontSize: '16px' }}>ℹ️</span>
        <span>Your order will be reviewed and scheduled by the logistics team.</span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={onConfirmOrder}>
          Confirm Order
        </button>
        <button className="btn btn-secondary" onClick={onEditOrder}>
          Edit Order
        </button>
      </div>
    </div>
  );
}

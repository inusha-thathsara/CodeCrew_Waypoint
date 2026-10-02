import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BRAND_CATALOGS } from '../data/mockData';

export default function PlaceOrderView({ currentStore, onProceedToReview, onCancel }) {
  const brandName = currentStore.brand || 'Waypoint Fresh';
  const catalog = BRAND_CATALOGS[brandName] || BRAND_CATALOGS['Waypoint Fresh'];

  // Initial products state matching Figma screenshot 02
  const [items, setItems] = useState([
    { id: '1', product: 'Milk', category: 'Chilled', available: 40, quantity: 18 },
    { id: '2', product: 'Yogurt', category: 'Chilled', available: 40, quantity: 10 },
    { id: '3', product: 'Vegetables', category: 'Ambient', available: 40, quantity: 8 },
    { id: '4', product: 'Chilled Chicken', category: 'Chilled', available: 30, quantity: 4 }
  ]);

  const [requestedDate, setRequestedDate] = useState('2026-09-25');
  const [preferredWindow, setPreferredWindow] = useState(currentStore.delivery_window || '5.30 AM - 8.00 AM');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(catalog[0]?.name || '');
  const [addQty, setAddQty] = useState(10);

  const handleQuantityChange = (id, newQty) => {
    const qty = Math.max(1, parseInt(newQty) || 0);
    setItems(items.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddProduct = () => {
    const catalogItem = catalog.find(c => c.name === selectedCatalogItem);
    if (!catalogItem) return;

    // Check if already in list
    const existing = items.find(i => i.product === catalogItem.name);
    if (existing) {
      setItems(items.map(i => i.product === catalogItem.name ? { ...i, quantity: i.quantity + addQty } : i));
    } else {
      setItems([...items, {
        id: Date.now().toString(),
        product: catalogItem.name,
        category: catalogItem.category,
        available: catalogItem.available,
        quantity: addQty
      }]);
    }
    setShowAddModal(false);
  };

  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleReviewClick = () => {
    if (items.length === 0) {
      alert('Please add at least one product line to place an order.');
      return;
    }
    const draftOrder = {
      id: `WF-${Math.floor(1000 + Math.random() * 9000)}`,
      store_name: currentStore.name || 'OUT002 : Kandy Fresh',
      outlet_id: currentStore.outlet_id || 'OUT002',
      requested_delivery_date: requestedDate,
      delivery_window: preferredWindow,
      items: items.map(i => ({
        product: i.product,
        category: i.category,
        quantity: i.quantity
      }))
    };
    onProceedToReview(draftOrder);
  };

  return (
    <div className="content-body">
      <div className="page-header">
        <h1 className="page-title">Place New Order</h1>
        <p className="page-subtitle">Create a product order for {currentStore.name || 'Kandy Fresh Outlet'}.</p>
      </div>

      {/* STORE Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="form-label">STORE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: '700' }}>
            {currentStore.outlet_id || 'OUT002'} : {currentStore.name ? currentStore.name.replace(/^[A-Z0-9]+ : /, '') : 'Kandy Fresh'}
          </span>
          <span className="badge badge-brand-fresh">
            {currentStore.brand || 'Waypoint Fresh'}
          </span>
        </div>
      </div>

      {/* Products Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Products</h3>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>AVAILABLE UNIT</th>
                  <th>QUANTITY</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '600' }}>{item.product}</td>
                    <td style={{ color: '#64748B' }}>{item.category}</td>
                    <td style={{ color: '#64748B' }}>{item.available} units</td>
                    <td style={{ width: '120px' }}>
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        min="1"
                        style={{ textAlign: 'center', fontWeight: '600' }}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                      No items added yet. Click <strong>+ Add Product</strong> below.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563EB',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          + Add Product
        </button>
      </div>

      {/* Requested Delivery Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Requested Delivery</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
            <div className="form-label">REQUESTED DELIVERY DATE</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
              25 September 2026
            </div>
          </div>

          <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
            <div className="form-label">PREFERRED DELIVERY WINDOW</div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
              {preferredWindow}
            </div>
          </div>
        </div>
      </div>

      {/* ORDER SUMMARY Card */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
        <div className="form-label" style={{ marginBottom: '12px' }}>ORDER SUMMARY</div>
        <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569' }}>
          <div>Total items <strong style={{ color: '#0F172A' }}>{totalItemsCount} units</strong></div>
          <div>Product lines <strong style={{ color: '#0F172A' }}>{items.length}</strong></div>
          <div>Requested date <strong style={{ color: '#0F172A' }}>27 September 2026</strong></div>
          <div>Delivery window <strong style={{ color: '#0F172A' }}>Before 8:00 AM</strong></div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={handleReviewClick}>
          Review Order
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Add Product to Order</h3>

            <div className="form-group">
              <label className="form-label">Select Product ({brandName})</label>
              <select 
                className="form-control" 
                value={selectedCatalogItem} 
                onChange={(e) => setSelectedCatalogItem(e.target.value)}
              >
                {catalog.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.category} - {c.available} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                value={addQty}
                onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddProduct}>
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Plus } from 'lucide-react';

export default function DashboardView({ 
  currentStore, 
  orders, 
  issues, 
  onNavigateToPlaceOrder, 
  onSelectOrderForTracking,
  onSelectOrderForReceiving,
  onSelectOrderForIssue
}) {
  const activeOrdersCount = orders.filter(o => o.status === 'On the way' || o.status === 'Submitted').length;
  const pendingIssuesCount = issues.filter(i => i.status === 'Under Review').length;

  const upcomingOrder = orders.find(o => o.status === 'On the way') || orders[0];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'On the way': return 'badge-on-the-way';
      case 'Delivered': return 'badge-delivered';
      case 'Deferred': return 'badge-deferred';
      case 'Issue Reported': return 'badge-issue';
      default: return 'badge-on-the-way';
    }
  };

  const handleActionClick = (order) => {
    if (order.status === 'On the way') {
      onSelectOrderForTracking(order);
    } else if (order.status === 'Delivered') {
      onSelectOrderForReceiving(order);
    } else if (order.status === 'Issue Reported') {
      onSelectOrderForIssue(order);
    } else {
      onSelectOrderForTracking(order);
    }
  };

  return (
    <div className="content-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Good morning, Store Manager</h1>
          <p className="page-subtitle">Here is what is happening at {currentStore.name || 'Kandy Fresh Outlet'} today.</p>
        </div>

        <button className="btn btn-primary" onClick={onNavigateToPlaceOrder}>
          <Plus size={18} />
          Place New Order
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active Orders</div>
          <div className="kpi-value">{activeOrdersCount}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Next Delivery</div>
          <div className="kpi-value">{upcomingOrder ? upcomingOrder.eta || '7:12 AM' : '7:12 AM'}</div>
          <div className="kpi-subtext">Order {upcomingOrder ? upcomingOrder.id : 'WF-1042'}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Pending Issues</div>
          <div className="kpi-value">{pendingIssuesCount}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Last Delivered</div>
          <div className="kpi-value">Yesterday</div>
          <div className="kpi-subtext">Order WF-1038</div>
        </div>
      </div>

      {/* Upcoming Delivery Card */}
      {upcomingOrder && (
        <div className="card" style={{ padding: '24px' }}>
          <div className="form-label" style={{ marginBottom: '8px' }}>UPCOMING DELIVERY</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Order {upcomingOrder.id}</h3>
                <span className={`badge ${getStatusBadgeClass(upcomingOrder.status)}`}>
                  {upcomingOrder.status}
                </span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Vehicle <strong style={{ color: '#0F172A' }}>{upcomingOrder.vehicle || 'VEH057'}</strong></div>
                <div>ETA <strong style={{ color: '#0F172A' }}>{upcomingOrder.eta || '7:12 AM'}</strong></div>
                <div>Delivery Window <strong style={{ color: '#0F172A' }}>{upcomingOrder.delivery_window || currentStore.delivery_window}</strong></div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => onSelectOrderForTracking(upcomingOrder)}>
              View Delivery
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Orders</h3>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>ORDER DATE</th>
                <th>DELIVERY DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: '600' }}>{ord.id}</td>
                  <td>{ord.order_date}</td>
                  <td>{ord.delivery_date}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td>
                    <span className="table-action-link" onClick={() => handleActionClick(ord)}>
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

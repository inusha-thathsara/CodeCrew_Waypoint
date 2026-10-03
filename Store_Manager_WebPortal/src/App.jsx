import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PlaceOrderView from './components/PlaceOrderView';
import ReviewOrderView from './components/ReviewOrderView';
import OrderSubmittedView from './components/OrderSubmittedView';
import OrderTrackingView from './components/OrderTrackingView';
import ReceiveDeliveryView from './components/ReceiveDeliveryView';
import ReportIssueView from './components/ReportIssueView';
import IssueSubmittedView from './components/IssueSubmittedView';
import StoreSelectorModal from './components/StoreSelectorModal';

import { 
  getStoredOrders, 
  saveOrders, 
  getStoredIssues, 
  saveIssues, 
  getStoredCurrentStore, 
  saveCurrentStore 
} from './data/mockData';
import { fetchOutlets } from './data/csvParser';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [viewState, setViewState] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showStoreSelector, setShowStoreSelector] = useState(false);

  // App Data States
  const [currentStore, setCurrentStore] = useState(getStoredCurrentStore());
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState(getStoredOrders());
  const [issues, setIssues] = useState(getStoredIssues());

  // Transient Form States
  const [draftOrder, setDraftOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || null);
  const [selectedIssueContext, setSelectedIssueContext] = useState(null);
  const [lastSubmittedIssue, setLastSubmittedIssue] = useState(null);

  // Load CSV outlets on mount
  useEffect(() => {
    fetchOutlets().then((loadedOutlets) => {
      setOutlets(loadedOutlets);
    });
  }, []);

  // Sync tab clicks with view state
  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    if (tabId === 'dashboard') setViewState('dashboard');
    else if (tabId === 'orders') setViewState('place-order');
    else if (tabId === 'deliveries') {
      const activeOrd = orders.find(o => o.status === 'On the way') || orders[0];
      setSelectedOrder(activeOrd);
      setViewState('order-tracking');
    }
    else if (tabId === 'issues') {
      const activeIssue = issues[0];
      setSelectedIssueContext({
        order_id: activeIssue?.order_id || 'WF-1043',
        vehicle: activeIssue?.vehicle || 'VEH057',
        product: activeIssue?.product || 'Milk',
        expected: activeIssue?.expected_qty || 18,
        received: activeIssue?.received_qty || 15
      });
      setViewState('report-issue');
    }
  };

  // Store Selection handler
  const handleSelectStore = (newStore) => {
    setCurrentStore(newStore);
    saveCurrentStore(newStore);
  };

  // Order Flow Handlers
  const handleProceedToReview = (draft) => {
    setDraftOrder(draft);
    setViewState('review-order');
  };

  const handleConfirmOrder = () => {
    const newOrder = {
      id: draftOrder.id,
      outlet_id: draftOrder.outlet_id,
      order_date: '25 Sep 2026',
      delivery_date: '26 Sep 2026',
      status: 'On the way',
      vehicle: 'VEH039',
      driver: 'Kasun',
      eta: '7:12 AM',
      delivery_window: draftOrder.delivery_window,
      items: draftOrder.items.map(i => ({
        product: i.product,
        expected: i.quantity,
        received: i.quantity,
        status: 'OK'
      }))
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    setSelectedOrder(newOrder);
    setViewState('order-submitted');
  };

  // Delivery Receive Handler
  const handleConfirmDelivery = (updatedOrder) => {
    const nextOrders = orders.map(o => o.id === updatedOrder.id ? { ...o, status: 'Delivered' } : o);
    setOrders(nextOrders);
    saveOrders(nextOrders);
    alert(`Delivery for Order ${updatedOrder.id} successfully received and verified.`);
    setViewState('dashboard');
    setCurrentTab('dashboard');
  };

  // Issue Flow Handlers
  const handleReportIssue = (context) => {
    setSelectedIssueContext(context);
    setViewState('report-issue');
    setCurrentTab('issues');
  };

  const handleSubmitIssue = (newIssue) => {
    const updatedIssues = [newIssue, ...issues];
    setIssues(updatedIssues);
    saveIssues(updatedIssues);

    // Update order status
    const nextOrders = orders.map(o => o.id === newIssue.order_id ? { ...o, status: 'Issue Reported' } : o);
    setOrders(nextOrders);
    saveOrders(nextOrders);

    setLastSubmittedIssue(newIssue);
    setViewState('issue-submitted');
  };

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenStoreSelector={() => setShowStoreSelector(true)}
      />

      <div className="main-wrapper">
        <Header
          currentStore={currentStore}
          onOpenStoreSelector={() => setShowStoreSelector(true)}
          setMobileOpen={setMobileOpen}
        />

        <main style={{ flex: 1 }}>
          {viewState === 'dashboard' && (
            <DashboardView
              currentStore={currentStore}
              orders={orders}
              issues={issues}
              onNavigateToPlaceOrder={() => {
                setViewState('place-order');
                setCurrentTab('orders');
              }}
              onSelectOrderForTracking={(ord) => {
                setSelectedOrder(ord);
                setViewState('order-tracking');
                setCurrentTab('deliveries');
              }}
              onSelectOrderForReceiving={(ord) => {
                setSelectedOrder(ord);
                setViewState('receive-delivery');
                setCurrentTab('deliveries');
              }}
              onSelectOrderForIssue={(ord) => {
                handleReportIssue({
                  order_id: ord.id,
                  vehicle: ord.vehicle || 'VEH057',
                  product: ord.items?.[0]?.product || 'Milk',
                  expected: ord.items?.[0]?.expected || 18,
                  received: ord.items?.[0]?.received || 15
                });
              }}
            />
          )}

          {viewState === 'place-order' && (
            <PlaceOrderView
              currentStore={currentStore}
              onProceedToReview={handleProceedToReview}
              onCancel={() => {
                setViewState('dashboard');
                setCurrentTab('dashboard');
              }}
            />
          )}

          {viewState === 'review-order' && (
            <ReviewOrderView
              draftOrder={draftOrder}
              onConfirmOrder={handleConfirmOrder}
              onEditOrder={() => setViewState('place-order')}
            />
          )}

          {viewState === 'order-submitted' && (
            <OrderSubmittedView
              orderId={selectedOrder?.id}
              onViewOrder={() => {
                setViewState('order-tracking');
                setCurrentTab('deliveries');
              }}
            />
          )}

          {viewState === 'order-tracking' && (
            <OrderTrackingView
              order={selectedOrder}
              currentStore={currentStore}
              onNavigateToReceive={(ord) => {
                setSelectedOrder(ord);
                setViewState('receive-delivery');
              }}
              onNavigateToDeferredView={() => {
                alert('Deferred Order WF-1031: Re-allocated to next delivery run on 29 September 2026.');
              }}
            />
          )}

          {viewState === 'receive-delivery' && (
            <ReceiveDeliveryView
              order={selectedOrder}
              onConfirmDelivery={handleConfirmDelivery}
              onReportIssue={handleReportIssue}
            />
          )}

          {viewState === 'report-issue' && (
            <ReportIssueView
              issueContext={selectedIssueContext}
              currentStore={currentStore}
              onSubmitIssue={handleSubmitIssue}
              onCancel={() => {
                setViewState('dashboard');
                setCurrentTab('dashboard');
              }}
            />
          )}

          {viewState === 'issue-submitted' && (
            <IssueSubmittedView
              issue={lastSubmittedIssue}
              onViewDashboard={() => {
                setViewState('dashboard');
                setCurrentTab('dashboard');
              }}
            />
          )}
        </main>
      </div>

      {/* Outlet Switcher Modal */}
      {showStoreSelector && (
        <StoreSelectorModal
          outlets={outlets}
          currentStore={currentStore}
          onSelectStore={handleSelectStore}
          onClose={() => setShowStoreSelector(false)}
        />
      )}
    </div>
  );
}

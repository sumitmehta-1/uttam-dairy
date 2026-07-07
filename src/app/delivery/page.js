'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { dbGetAllOrders, dbUpdateOrderStatus } from '@/lib/db';

export default function DeliveryDashboard() {
  const { user, loading, isDelivery, isAdmin, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'completed'
  const [orders, setOrders] = useState([]);

  // Protect route — only delivery boy or admin can access
  useEffect(() => {
    if (!loading && (!user || !user.loggedIn)) {
      router.push('/');
    } else if (!loading && user && !isDelivery() && !isAdmin()) {
      router.push('/');
      showToast('Access denied. Delivery partners only.', 'error');
    }
  }, [user, loading]);

  // Load orders from database (Supabase with localStorage fallback)
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await dbGetAllOrders();
        setOrders(data);
      } catch (e) {
        console.error('Error loading orders:', e);
        setOrders([]);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkDelivered = async (orderId) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Delivered' } : o))
    );

    const success = await dbUpdateOrderStatus(orderId, 'Delivered');
    if (success) {
      showToast(`Order ${orderId} marked as Delivered ✓`, 'success');
    } else {
      showToast('Failed to update status in database', 'error');
      // Revert UI to match db state
      try {
        const data = await dbGetAllOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const assignedOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');
  const completedOrders = orders.filter(o => o.status === 'Delivered');

  if (loading || !user || !user.loggedIn) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-pale)', fontFamily: 'var(--font-body)' }}>
      {/* Delivery Navbar — Simplified */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--green-deep)',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>🐄</span>
          <div>
            <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.1rem' }}>Uttam Dairy</div>
            <div style={{ color: 'var(--gold-light)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>🛵 Delivery Partner</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: '600' }}>
            👤 {user.name}
          </span>
          <button
            onClick={() => { logout(); router.push('/'); }}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '2rem', fontWeight: '800' }}>
            🛵 Delivery Dashboard
          </h1>
          <p style={{ color: 'var(--charcoal-light)', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage assigned deliveries and mark orders as completed.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: '180px', background: '#FFF3CD', borderRadius: 'var(--radius-md)',
            padding: '20px', border: '1px solid #FFEBAA', textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#856404' }}>{assignedOrders.length}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#856404' }}>📦 Pending Deliveries</div>
          </div>
          <div style={{
            flex: 1, minWidth: '180px', background: 'var(--green-pale)', borderRadius: 'var(--radius-md)',
            padding: '20px', border: '1px solid var(--green-soft)', textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--green-deep)' }}>{completedOrders.length}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--green-deep)' }}>✅ Completed Today</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setActiveTab('assigned')}
            style={{
              flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', border: 'none',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
              background: activeTab === 'assigned' ? 'var(--green-primary)' : 'transparent',
              color: activeTab === 'assigned' ? 'white' : 'var(--charcoal-light)'
            }}
          >
            📦 Assigned Orders ({assignedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', border: 'none',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
              background: activeTab === 'completed' ? 'var(--green-primary)' : 'transparent',
              color: activeTab === 'completed' ? 'white' : 'var(--charcoal-light)'
            }}
          >
            ✅ Completed ({completedOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(activeTab === 'assigned' ? assignedOrders : completedOrders).length === 0 ? (
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '60px 24px',
              textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                {activeTab === 'assigned' ? '📭' : '📦'}
              </div>
              <h3 style={{ color: 'var(--charcoal)', fontWeight: '700', marginBottom: '4px' }}>
                {activeTab === 'assigned' ? 'No pending deliveries' : 'No completed deliveries yet'}
              </h3>
              <p style={{ color: 'var(--gray-medium)', fontSize: '0.85rem' }}>
                {activeTab === 'assigned' ? 'All deliveries are completed! Great work.' : 'Completed orders will appear here.'}
              </p>
            </div>
          ) : (
            (activeTab === 'assigned' ? assignedOrders : completedOrders).map((order) => (
              <div key={order.id} style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.15rem', color: 'var(--green-deep)' }}>
                      {order.id}
                    </span>
                    <span style={{
                      marginLeft: '10px', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                      background: order.status === 'Pending' ? '#FFF3CD' : order.status === 'Confirmed' ? '#D4EDDA' : '#D4EDDA',
                      color: order.status === 'Pending' ? '#856404' : '#155724'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-medium)' }}>{order.date}</span>
                </div>

                {/* Customer Details Card */}
                <div style={{
                  background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '16px',
                  marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--charcoal)' }}>👤 Customer:</strong>{' '}
                    <span style={{ color: 'var(--charcoal-light)' }}>{order.name || 'N/A'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--charcoal)' }}>📞 Contact:</strong>{' '}
                    <a href={`tel:${order.phone}`} style={{ color: 'var(--green-primary)', fontWeight: '700', textDecoration: 'none' }}>
                      {order.phone || 'N/A'}
                    </a>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--charcoal)' }}>📍 Delivery Location:</strong>{' '}
                    <span style={{ color: 'var(--charcoal-light)' }}>{order.address || 'N/A'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--charcoal)' }}>💳 Payment:</strong>{' '}
                    <span style={{ color: 'var(--charcoal-light)', textTransform: 'uppercase' }}>
                      {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '📱 UPI'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '8px', textTransform: 'uppercase' }}>Order Items</div>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                      borderBottom: idx < order.items.length - 1 ? '1px solid var(--gray-pale)' : 'none',
                      fontSize: '0.82rem'
                    }}>
                      <span style={{ color: 'var(--charcoal)' }}>{item.name} ({item.weight}) × {item.quantity}</span>
                      <span style={{ fontWeight: '700', color: 'var(--charcoal)' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Footer — Total & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--gray-light)', paddingTop: '14px' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--green-deep)' }}>
                    Total: ₹{order.total}
                  </div>

                  {activeTab === 'assigned' && (
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      style={{
                        background: 'var(--green-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      ✅ Mark as Delivered
                    </button>
                  )}

                  {activeTab === 'completed' && (
                    <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.85rem' }}>
                      ✓ Delivered
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

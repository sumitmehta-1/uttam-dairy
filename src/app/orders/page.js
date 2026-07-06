'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import LocationPicker from '@/components/LocationPicker';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

const MOCK_PAST_ORDERS = [
  { id: 'ORD-9380', date: '06 July 2026, 03:00 PM', items: [{ name: 'Pure White Table Butter', qty: 1, weight: '200 g', price: 110 }, { name: 'Fresh Soft Paneer (Family Pack)', qty: 1, weight: '500 g', price: 260 }], total: 370, status: 'Delivered', address: 'Dwarka Sector 4, DDA Flats, Pocket-Q, New Delhi' },
  { id: 'ORD-9379', date: '06 July 2026, 02:15 PM', items: [{ name: 'Uttam Premium Cow Milk', qty: 3, weight: '500 ml', price: 33 }], total: 99, status: 'Delivered', address: 'Dwarka Sector 22, Rose Apartments, Block-D, New Delhi' }
];

export default function OrderHistory() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState([]);

  useEffect(() => {
    if (!loading && (!user || !user.loggedIn)) {
      router.push('/');
      showToast('Please login to view order history', 'error');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.loggedIn) {
      // Only seed mock orders for predefined showcase accounts
      if (user.phone === '9999999999' || user.name === 'Test Customer' || user.phone === '9876543210') {
        setPastOrders(MOCK_PAST_ORDERS);
      } else {
        setPastOrders([]);
      }
    }
  }, [user]);

  if (loading || !user || !user.loggedIn) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
        fontFamily: 'var(--font-body)'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenLogin={() => setLoginOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenLocation={() => setLocationOpen(true)}
      />

      <main className="main-content" style={{ padding: '40px 24px', paddingTop: 'calc(var(--nav-height) + 30px)', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--green-primary)',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          ← Back to Shop
        </Link>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
            📦 My Order History
          </h1>
          <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem' }}>
            Track your active orders and check invoices of previous deliveries.
          </p>
        </div>

        {pastOrders.length === 0 ? (
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(0,0,0,0.06)',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--gray-medium)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '3rem' }}>📦</span>
            <h3 style={{ color: 'var(--charcoal)', marginTop: '16px', marginBottom: '6px' }}>No orders placed yet</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '24px' }}>Fresh cow milk and natural ghee are waiting for you!</p>
            <a href="/" style={{
              background: 'linear-gradient(135deg, var(--green-primary), var(--green-light))',
              color: 'white',
              padding: '10px 24px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(44,107,70,0.2)'
            }}>
              Start Shopping
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pastOrders.map((order) => {
              let statusBg = 'var(--gray-pale)';
              let statusColor = 'var(--charcoal-light)';
              if (order.status === 'Pending') { statusBg = '#FFF3CD'; statusColor = '#856404'; }
              else if (order.status === 'Out for Delivery') { statusBg = '#D1ECF1'; statusColor = '#0C5460'; }
              else if (order.status === 'Delivered') { statusBg = 'var(--green-pale)'; statusColor = 'var(--green-deep)'; }

              return (
                <div key={order.id} style={{
                  background: 'var(--white)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Order header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontWeight: '800', color: 'var(--green-primary)', marginRight: '12px' }}>{order.id}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-medium)' }}>{order.date}</span>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem',
                      fontWeight: '700', background: statusBg, color: statusColor, textTransform: 'uppercase'
                    }}>{order.status}</span>
                  </div>

                  {/* Items Summary list */}
                  <div style={{ borderTop: '1px solid var(--gray-pale)', borderBottom: '1px solid var(--gray-pale)', padding: '12px 0' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '4px 0' }}>
                        <span style={{ color: 'var(--charcoal-light)' }}>
                          {item.name} ({item.weight}) <strong style={{ color: 'var(--charcoal)' }}>x {item.qty}</strong>
                        </span>
                        <span style={{ fontWeight: '600' }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total and details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-medium)', maxWidth: '380px' }}>
                      📍 <strong>Address:</strong> {order.address}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                      Total Bill: <span style={{ color: 'var(--green-deep)' }}>₹{order.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODALS */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LocationPicker isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

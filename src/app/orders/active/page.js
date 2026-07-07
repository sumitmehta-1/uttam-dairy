'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import LocationPicker from '@/components/LocationPicker';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { PRODUCTS } from '@/lib/products';
import Link from 'next/link';
import { dbUpdateOrderStatus, dbUpdateOrderItems } from '@/lib/db';

export default function ActiveOrderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  // Active order states
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isCancelled, setIsCancelled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const timerRef = useRef(null);

  // Load active order on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('uttam_active_order');
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      setOrder(parsed);

      // Calculate elapsed time since order placement
      const elapsedSeconds = Math.floor((Date.now() - parsed.timestamp) / 1000);
      if (parsed.status === 'Cancelled') {
        setIsCancelled(true);
        setTimeLeft(0);
        setIsLocked(true);
      } else if (elapsedSeconds >= 180) {
        setTimeLeft(0);
        setIsLocked(true);
        // Sync locked status in state
        updateOrderStatus('Confirmed');
      } else {
        setTimeLeft(180 - elapsedSeconds);
      }
    } else if (!loading) {
      // Redirect to homepage if no active order found
      router.push('/');
    }
  }, [loading]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isCancelled && !isLocked) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsLocked(true);
            updateOrderStatus('Confirmed');
            showToast('Order confirmed! We are packing your fresh dairy items.', 'success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isCancelled, isLocked]);

  const updateOrderStatus = (newStatus) => {
    setOrder((prev) => {
      if (!prev) return null;
      const updated = { ...prev, status: newStatus };
      localStorage.setItem('uttam_active_order', JSON.stringify(updated));
      
      // Update in Supabase/localStorage database
      dbUpdateOrderStatus(prev.id, newStatus);
      return updated;
    });
  };

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setIsCancelled(true);
      setIsLocked(true);
      setTimeLeft(0);
      updateOrderStatus('Cancelled');
      showToast('Order cancelled successfully. Refund initiated (if paid via UPI).', 'info');
    }
  };

  const handleAddItemToOrder = (product) => {
    if (isLocked || isCancelled) return;

    setOrder((prev) => {
      if (!prev) return null;

      // Check if item exists in order
      const existingItem = prev.items.find(item => item.id === product.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = prev.items.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...prev.items, { ...product, quantity: 1 }];
      }

      // Re-calculate pricing totals
      const newSubtotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const newDeliveryFee = newSubtotal >= 299 ? 0 : 25;
      const newHandlingFee = 4;
      const newTotal = newSubtotal + newDeliveryFee + newHandlingFee;

      const updatedOrder = {
        ...prev,
        items: updatedItems,
        subtotal: newSubtotal,
        deliveryFee: newDeliveryFee,
        handlingFee: newHandlingFee,
        total: newTotal,
        timestamp: Date.now() // Reset timer timestamp to current time
      };

      localStorage.setItem('uttam_active_order', JSON.stringify(updatedOrder));

      // Update order details in Supabase/localStorage database
      dbUpdateOrderItems(prev.id, updatedItems, newSubtotal, newDeliveryFee, newHandlingFee, newTotal);

      // Reset local countdown timer to 3 minutes
      setTimeLeft(180);
      showToast(`${product.name} added! Timer reset to 3 minutes.`, 'success');

      return updatedOrder;
    });
  };

  // Helper formatting for countdown display MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading || !user || !user.loggedIn || !order) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
        Loading Active Order Details...
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

      <main className="main-content" style={{ padding: '40px 24px', paddingTop: 'calc(var(--nav-height) + 30px)', maxWidth: '800px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-body)' }}>
        
        {/* Back Link */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--green-primary)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', marginBottom: '20px' }}>
          ← Back to Shop
        </Link>

        {/* ORDER TRACKING CONTAINER CARD */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(0,0,0,0.06)',
          padding: '32px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '28px',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--gray-pale)', paddingBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--gray-medium)', fontWeight: '700', textTransform: 'uppercase' }}>Active Order</span>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '2rem', fontWeight: '800', marginTop: '2px' }}>
                {order.id}
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--charcoal-light)', marginTop: '4px' }}>Placed on {order.date}</p>
            </div>
            
            {/* Countdown / Status Box */}
            <div style={{ textAlign: 'right' }}>
              {!isLocked && timeLeft > 0 ? (
                <div style={{
                  background: '#FFF3CD',
                  border: '1px solid #FFEBAA',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#856404', textTransform: 'uppercase' }}>⏱️ Modify Window</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#856404' }}>{formatTime(timeLeft)}</span>
                </div>
              ) : (
                <div style={{
                  background: isCancelled ? '#F8D7DA' : 'var(--green-pale)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 20px',
                  fontWeight: '800',
                  color: isCancelled ? '#721C24' : 'var(--green-deep)',
                  fontSize: '1.1rem',
                  textTransform: 'uppercase'
                }}>
                  {isCancelled ? '❌ Cancelled' : '✓ Confirmed'}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Stepper timeline - only shows if order is confirmed/not cancelled */}
          {!isCancelled && (
            <div style={{ margin: '32px 0', background: 'var(--gray-pale)', padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '20px' }}>Delivery Progress</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', alignItems: 'center' }}>
                {/* Connector line */}
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  right: '20px',
                  height: '4px',
                  background: isLocked ? 'var(--green-primary)' : 'var(--gray-light)',
                  zIndex: 1,
                  top: '12px'
                }}></div>

                {/* Steps */}
                {[
                  { label: 'Placed', done: true },
                  { label: 'Prepared', done: isLocked },
                  { label: 'Out for Delivery', done: false },
                  { label: 'Arrived', done: false }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: step.done ? 'var(--green-primary)' : 'var(--white)',
                      border: '3px solid',
                      borderColor: step.done ? 'var(--green-primary)' : 'var(--gray-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.done ? 'white' : 'var(--gray-medium)',
                      fontWeight: '800',
                      fontSize: '0.72rem'
                    }}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: step.done ? 'var(--green-deep)' : 'var(--charcoal-light)', marginTop: '8px', textAlign: 'center' }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {!isLocked && (
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: '#856404', fontWeight: '600' }}>
                  ⏳ Order preparing in 3 mins. You can cancel or add items right now!
                </div>
              )}
            </div>
          )}

          {/* Cancelled view banner */}
          {isCancelled && (
            <div style={{
              background: '#F8D7DA',
              border: '1px solid #F5C6CB',
              color: '#721C24',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              margin: '24px 0',
              fontSize: '0.85rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🚨 This order was cancelled. Any online payment has been refunded to your source UPI account.
            </div>
          )}

          {/* Items Summary list */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '12px' }}>Items Summary</h3>
            <div style={{ border: '1px solid var(--gray-pale)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--gray-pale)'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--charcoal)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-medium)' }}>{item.weight} x {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--charcoal)' }}>₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details & Bill Summary */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', background: 'var(--gray-pale)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
              <div><strong>📍 Delivery Location:</strong> <span style={{ color: 'var(--charcoal-light)' }}>{order.address}</span></div>
              <div><strong>👤 Customer:</strong> <span style={{ color: 'var(--charcoal-light)' }}>{order.name} ({order.phone})</span></div>
              <div><strong>💳 Payment Method:</strong> <span style={{ color: 'var(--charcoal-light)', textTransform: 'uppercase' }}>{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '📱 UPI GPay'}</span></div>
            </div>
            
            <div style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Handling Charge</span><span>₹{order.handlingFee}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '1px dashed var(--gray-medium)', paddingTop: '6px', marginTop: '6px', fontSize: '1rem', color: 'var(--green-deep)' }}>
                <span>Total Bill</span><span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Action Row - Cancel button */}
          {!isLocked && !isCancelled && (
            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelOrder}
                style={{
                  background: 'none',
                  border: '2px solid var(--danger)',
                  color: 'var(--danger)',
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'background 200ms'
                }}
              >
                Cancel Order ❌
              </button>
            </div>
          )}
        </div>

        {/* QUICK ADD ITEMS CAROUSEL (3 Minute modify window) */}
        {!isLocked && !isCancelled && (
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--green-soft)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '1.25rem', fontWeight: '800' }}>
                🥛 Add Items to Active Order
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--charcoal-light)' }}>
                Forgot something? Click ADD to instantly add fresh dairy items to your order. The 3-minute timer will reset.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              padding: '6px 2px 14px',
              scrollbarWidth: 'thin'
            }}>
              {PRODUCTS.filter(p => p.inStock).map((product) => (
                <div key={product.id} style={{
                  flex: '0 0 160px',
                  background: 'var(--white)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'center'
                }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '80px', objectFit: 'contain', background: 'var(--cream)', borderRadius: '4px' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80'; }}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: '800', color: 'var(--green-deep)' }}>₹{product.price}</span>
                    <span style={{ color: 'var(--gray-medium)', fontSize: '0.68rem' }}>{product.weight}</span>
                  </div>
                  <button
                    onClick={() => handleAddItemToOrder(product)}
                    style={{
                      background: 'var(--green-pale)',
                      color: 'var(--green-deep)',
                      border: '1px solid var(--green-soft)',
                      borderRadius: '4px',
                      padding: '4px 0',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 200ms'
                    }}
                  >
                    + ADD
                  </button>
                </div>
              ))}
            </div>
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

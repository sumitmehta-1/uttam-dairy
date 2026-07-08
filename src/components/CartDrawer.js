'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { dbSaveOrder } from '@/lib/db';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'upi'

  if (!isOpen) return null;

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 25;
  const handlingFee = subtotal > 0 ? 4 : 0;
  const total = subtotal + deliveryFee + handlingFee;

  const handleCheckout = async () => {
    if (!user || !user.loggedIn) {
      showToast('Please log in first', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    // Prepare active order data
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
      items: cart.map(item => ({ ...item })),
      subtotal,
      deliveryFee,
      handlingFee,
      total,
      paymentMethod,
      address: user.address,
      phone: user.phone,
      name: user.name,
      status: 'Pending'
    };

    try {
      // Save order to the shared database first. If Supabase is configured but
      // blocked, we must not pretend the order succeeded only on this phone.
      await dbSaveOrder(newOrder);

      // Save order in localStorage for active tracking screen
      localStorage.setItem('uttam_active_order', JSON.stringify(newOrder));

      showToast('Order placed successfully! Redirecting...', 'success');
      clearCart();
      onClose();
      router.push('/orders/active');
    } catch (e) {
      console.error(e);
      showToast(e.message || 'Order could not be saved. Please contact the shop.', 'error');
    }
  };

  return (
    <div className="cart-overlay open" onClick={onClose}>
      <div className="cart-drawer open" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            <span>🛒</span> My Cart
          </h2>
          <button className="cart-drawer-close" onClick={onClose}>&times;</button>
        </div>

        {/* Location & User Info Bar (Zomato style) */}
        {user && user.loggedIn && (
          <div style={{
            background: 'var(--cream)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            padding: '14px 20px',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.1rem' }}>📍</span>
              <span style={{ fontWeight: '700', color: 'var(--green-deep)' }}>Delivering to:</span>
            </div>
            <div style={{ color: 'var(--charcoal-light)', paddingLeft: '22px', fontSize: '0.8rem', lineHeight: '1.3' }}>
              {user.address}
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingLeft: '22px',
              marginTop: '6px',
              fontSize: '0.75rem',
              color: 'var(--gray-medium)',
              fontWeight: '600'
            }}>
              <span>👤 {user.name}</span>
              <span>📞 {user.phone}</span>
            </div>
          </div>
        )}

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🐄</span>
              <h3>Your cart is empty</h3>
              <p>Add some fresh dairy products from our catalog to get started.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <span className="cart-item-weight">{item.weight}</span>
                  <div className="cart-item-price">₹{item.price * item.quantity}</div>
                </div>

                <div className="cart-item-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span className="cart-qty">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            {/* Payment Method Option Selector */}
            <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--gray-pale)', paddingBottom: '12px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--charcoal)', marginBottom: '8px' }}>
                💳 Select Payment Method
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid',
                    borderColor: paymentMethod === 'cod' ? 'var(--green-primary)' : 'var(--gray-light)',
                    background: paymentMethod === 'cod' ? 'var(--green-pale)' : 'white',
                    color: paymentMethod === 'cod' ? 'var(--green-deep)' : 'var(--charcoal-light)',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPaymentMethod('cod')}
                >
                  💵 Cash on Delivery
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid',
                    borderColor: paymentMethod === 'upi' ? 'var(--green-primary)' : 'var(--gray-light)',
                    background: paymentMethod === 'upi' ? 'var(--green-pale)' : 'white',
                    color: paymentMethod === 'upi' ? 'var(--green-deep)' : 'var(--charcoal-light)',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPaymentMethod('upi')}
                >
                  📱 Pay via UPI QR
                </button>
              </div>

              {/* UPI QR Code view block */}
              {paymentMethod === 'upi' && (
                <div style={{
                  background: 'var(--gray-pale)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px dashed var(--gray-light)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--charcoal-light)', textAlign: 'center' }}>
                    Scan & Pay ₹{total} via Google Pay
                  </div>
                  <img
                    src="/upi-qr.png"
                    alt="UPI QR Code"
                    style={{ width: '130px', height: '130px', border: '2px solid white', borderRadius: '4px' }}
                    onError={(e) => {
                      e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=uttamdairy@okaxis';
                    }}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--green-primary)', fontWeight: '700' }}>
                    ✓ Screenshot payment confirmation for verification
                  </div>
                </div>
              )}
            </div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span> : `₹${deliveryFee}`}</span>
            </div>
            <div className="cart-summary-row">
              <span>Handling Charge</span>
              <span>₹{handlingFee}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total Bill</span>
              <span>₹{total}</span>
            </div>

            <button className="cart-checkout-btn ripple-effect" onClick={handleCheckout}>
              <span>✨</span> Place Order & Track
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

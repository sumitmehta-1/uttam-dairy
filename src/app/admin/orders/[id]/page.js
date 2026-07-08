'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { dbGetAllOrders, dbUpdateOrderStatus } from '@/lib/db';

export default function AdminOrderDetail() {
  const params = useParams();
  const orderId = decodeURIComponent(params.id || '');
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orders = await dbGetAllOrders();
        setOrder((orders || []).find((item) => item.id === orderId) || null);
      } catch (e) {
        console.error('Error loading order detail:', e);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    const previous = order;
    setOrder((current) => ({ ...current, status: newStatus }));

    try {
      await dbUpdateOrderStatus(order.id, newStatus);
      showToast(`Order ${order.id} updated to ${newStatus}`, 'success');
    } catch (e) {
      console.error(e);
      setOrder(previous);
      showToast(e.message || 'Failed to update order status', 'error');
    }
  };

  const items = Array.isArray(order?.items) ? order.items : [];
  const subtotal = Number(order?.subtotal || 0);
  const deliveryFee = Number(order?.deliveryFee || order?.delivery_fee || 0);
  const handlingFee = Number(order?.handlingFee || order?.handling_fee || 0);
  const total = Number(order?.total || 0);

  if (loading) {
    return (
      <div style={{ fontFamily: 'var(--font-body)', color: 'var(--charcoal-light)', fontWeight: '700' }}>
        Loading order bill...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ fontFamily: 'var(--font-body)' }}>
        <Link href="/admin/orders" style={{ color: 'var(--green-primary)', fontWeight: '700', textDecoration: 'none' }}>
          Back to Orders
        </Link>
        <div style={{ marginTop: '24px', background: 'var(--white)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 'var(--radius-md)', padding: '28px', color: 'var(--charcoal-light)', fontWeight: '700' }}>
          Order not found.
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', maxWidth: '980px' }}>
      <Link href="/admin/orders" style={{ color: 'var(--green-primary)', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', marginBottom: '20px' }}>
        Back to Orders
      </Link>

      <div style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '28px', borderBottom: '1px solid var(--gray-pale)', display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'var(--gray-medium)', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase' }}>Order Bill</div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '2rem', fontWeight: '800', marginTop: '4px' }}>
              {order.id}
            </h1>
            <div style={{ color: 'var(--charcoal-light)', fontSize: '0.86rem', marginTop: '4px' }}>
              {order.date || (order.timestamp ? new Date(order.timestamp).toLocaleString() : 'No date')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
            <label htmlFor="order-status" style={{ color: 'var(--gray-medium)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
              Update Status
            </label>
            <select
              id="order-status"
              value={order.status || 'Pending'}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-light)', fontWeight: '700', color: 'var(--charcoal)' }}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', borderBottom: '1px solid var(--gray-pale)' }}>
          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
            <div style={{ color: 'var(--gray-medium)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Customer</div>
            <div style={{ color: 'var(--charcoal)', fontWeight: '800' }}>{order.name || 'N/A'}</div>
            <div style={{ color: 'var(--charcoal-light)', marginTop: '6px', fontWeight: '700' }}>Phone: {order.phone || 'N/A'}</div>
          </div>

          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
            <div style={{ color: 'var(--gray-medium)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Delivery Address</div>
            <div style={{ color: 'var(--charcoal-light)', lineHeight: '1.45', fontWeight: '600' }}>{order.address || 'N/A'}</div>
          </div>

          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
            <div style={{ color: 'var(--gray-medium)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Payment</div>
            <div style={{ color: 'var(--charcoal)', fontWeight: '800', textTransform: 'uppercase' }}>{order.paymentMethod || order.payment_method || 'N/A'}</div>
            <div style={{ color: 'var(--charcoal-light)', marginTop: '6px', fontWeight: '700' }}>Status: {order.status || 'Pending'}</div>
          </div>
        </div>

        <div style={{ padding: '28px' }}>
          <h2 style={{ color: 'var(--charcoal)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px' }}>Items</h2>
          <div style={{ border: '1px solid var(--gray-pale)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {items.length === 0 ? (
              <div style={{ padding: '18px', color: 'var(--gray-medium)', fontWeight: '700' }}>No items found.</div>
            ) : (
              items.map((item, index) => {
                const qty = Number(item.quantity || item.qty || 1);
                const price = Number(item.price || 0);
                return (
                  <div key={`${item.id || item.name}-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', padding: '14px 18px', borderBottom: index === items.length - 1 ? 'none' : '1px solid var(--gray-pale)' }}>
                    <div>
                      <div style={{ color: 'var(--charcoal)', fontWeight: '800' }}>{item.name}</div>
                      <div style={{ color: 'var(--gray-medium)', fontSize: '0.78rem', marginTop: '3px' }}>{item.weight || 'Item'} x {qty} at Rs {price}</div>
                    </div>
                    <div style={{ color: 'var(--charcoal)', fontWeight: '800' }}>Rs {price * qty}</div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginLeft: 'auto', marginTop: '20px', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--charcoal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>Rs {subtotal}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery Fee</span><strong>{deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee}`}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Handling Charge</span><strong>Rs {handlingFee}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--gray-medium)', paddingTop: '10px', color: 'var(--green-deep)', fontSize: '1.1rem' }}>
              <span style={{ fontWeight: '800' }}>Total Bill</span>
              <strong>Rs {total}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

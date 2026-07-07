'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { dbGetAllOrders, dbUpdateOrderStatus } from '@/lib/db';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const { showToast } = useToast();

  const loadOrders = async () => {
    try {
      const data = await dbGetAllOrders();
      setOrders(data);
    } catch (e) {
      console.error('Error loading orders:', e);
    }
  };

  useEffect(() => {
    loadOrders();
    // Poll for new orders every 5 seconds
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    const success = await dbUpdateOrderStatus(orderId, newStatus);
    if (success) {
      showToast(`Order ${orderId} updated to ${newStatus}!`, 'success');
    } else {
      showToast('Failed to update status in database', 'error');
      loadOrders();
    }
  };

  const formatItemsSummary = (items) => {
    if (!items) return 'No items';
    if (typeof items === 'string') return items; // Fallback for mock strings
    if (Array.isArray(items)) {
      return items.map(it => `${it.name} (${it.weight || ''}) x ${it.quantity}`).join(', ');
    }
    return 'Invalid items format';
  };

  const filteredOrders = orders.filter((ord) => {
    const customerName = ord.name || '';
    const orderId = ord.id || '';
    const phone = ord.phone || '';

    const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) ||
                          orderId.toLowerCase().includes(search.toLowerCase()) ||
                          phone.includes(search);
    const matchesStatus = filterStatus === 'All' || ord.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--charcoal)', fontSize: '2rem', fontWeight: '800' }}>Orders Database</h1>
          <p style={{ color: 'var(--gray-medium)', fontSize: '0.88rem' }}>Check, filter, search, and update customer order delivery status logs.</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--gray-medium)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search Order ID, name, or phone..."
            style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', border: '1px solid var(--gray-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories filters */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {['All', 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              type="button"
              style={{
                padding: '6px 14px',
                border: '1px solid',
                borderColor: filterStatus === status ? 'var(--green-primary)' : 'var(--gray-light)',
                background: filterStatus === status ? 'var(--green-pale)' : 'white',
                color: filterStatus === status ? 'var(--green-deep)' : 'var(--charcoal-light)',
                fontSize: '0.78rem',
                fontWeight: '700',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Log */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--gray-pale)', color: 'var(--charcoal-light)', borderBottom: '1px solid var(--gray-light)', fontWeight: '700' }}>
                <th style={{ padding: '16px' }}>Order ID</th>
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Customer</th>
                <th style={{ padding: '16px' }}>Items Summary</th>
                <th style={{ padding: '16px' }}>Delivery Address</th>
                <th style={{ padding: '16px' }}>Total Bill</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-medium)', fontWeight: '600' }}>
                    No matching orders in the log logs.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  let statusBg = 'var(--gray-pale)';
                  let statusColor = 'var(--charcoal-light)';
                  if (ord.status === 'Pending') { statusBg = '#FFF3CD'; statusColor = '#856404'; }
                  else if (ord.status === 'Confirmed') { statusBg = '#D4EDDA'; statusColor = '#155724'; }
                  else if (ord.status === 'Out for Delivery') { statusBg = '#D1ECF1'; statusColor = '#0C5460'; }
                  else if (ord.status === 'Delivered') { statusBg = 'var(--green-pale)'; statusColor = 'var(--green-deep)'; }
                  else if (ord.status === 'Cancelled') { statusBg = '#F8D7DA'; statusColor = '#721C24'; }

                  return (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--gray-pale)', transition: 'background 150ms' }}>
                      <td style={{ padding: '16px', fontWeight: '700', color: 'var(--green-primary)' }}>{ord.id}</td>
                      <td style={{ padding: '16px', color: 'var(--charcoal-light)' }}>{ord.date || new Date(ord.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--charcoal)' }}>{ord.name}</div>
                        <div style={{ color: 'var(--gray-medium)', fontSize: '0.75rem' }}>📞 {ord.phone}</div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--charcoal-light)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatItemsSummary(ord.items)}>
                        {formatItemsSummary(ord.items)}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--charcoal-light)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ord.address}>
                        {ord.address}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '800', color: 'var(--charcoal)' }}>₹{ord.total}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem',
                          fontWeight: '700', background: statusBg, color: statusColor, textTransform: 'uppercase'
                        }}>{ord.status}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--gray-light)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

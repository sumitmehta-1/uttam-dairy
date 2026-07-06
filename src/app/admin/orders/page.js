'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/Toast';

// Seeding Mock Store Orders
const MOCK_ORDERS = [
  { id: 'ORD-9382', name: 'Aarav Sharma', phone: '9876543210', items: 'Cow Milk (1L) x 2, Paneer (200g) x 1', total: 243, address: 'Dwarka Sector 12, Flat 104, Block-B, New Delhi', status: 'Out for Delivery', date: '06 July 2026, 04:15 PM' },
  { id: 'ORD-9381', name: 'Pooja Patel', phone: '9988776655', items: 'Desi Cow Ghee (1L) x 1, Claypot Dahi x 1', total: 770, address: 'Dwarka Sector 10, Pocket 2, House 14, New Delhi', status: 'Pending', date: '06 July 2026, 04:02 PM' },
  { id: 'ORD-9380', name: 'Vikram Singh', phone: '9123456789', items: 'Table Butter (200g) x 1, Soft Paneer (500g) x 1', total: 370, address: 'Dwarka Sector 4, DDA Flats, Pocket-Q, New Delhi', status: 'Delivered', date: '06 July 2026, 03:00 PM' },
  { id: 'ORD-9379', name: 'Neha Gupta', phone: '9345678901', items: 'Cow Milk (500ml) x 3', total: 99, address: 'Dwarka Sector 22, Rose Apartments, Block-D, New Delhi', status: 'Delivered', date: '06 July 2026, 02:15 PM' },
  { id: 'ORD-9378', name: 'Amit Verma', phone: '9812345678', items: 'Milk Sweets (Peda) x 2, Set Curd x 1', total: 400, address: 'Janakpuri Block C1, House 98, New Delhi', status: 'Cancelled', date: '06 July 2026, 11:30 AM' }
];

export default function AdminOrders() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const { showToast } = useToast();

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Order ${orderId} updated to ${newStatus}!`, 'success');
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = ord.name.toLowerCase().includes(search.toLowerCase()) ||
                          ord.id.toLowerCase().includes(search.toLowerCase()) ||
                          ord.phone.includes(search);
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
        padding: '18px 24px',
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
                borderRadius: 'var(--radius-sm)',
                background: filterStatus === status ? 'var(--green-pale)' : 'white',
                color: filterStatus === status ? 'var(--green-deep)' : 'var(--charcoal-light)',
                fontSize: '0.78rem',
                fontWeight: '700'
              }}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-medium)' }}>
            <span style={{ fontSize: '32px' }}>📦</span>
            <p style={{ marginTop: '8px', fontWeight: '600' }}>No customer orders match the filter constraints.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-pale)', color: 'var(--charcoal-light)', borderBottom: '1px solid var(--gray-light)', fontWeight: '700' }}>
                  <th style={{ padding: '16px' }}>Order ID</th>
                  <th style={{ padding: '16px' }}>Date & Time</th>
                  <th style={{ padding: '16px' }}>Customer Details</th>
                  <th style={{ padding: '16px' }}>Items Summary</th>
                  <th style={{ padding: '16px' }}>Bill Total</th>
                  <th style={{ padding: '16px' }}>Delivery Address</th>
                  <th style={{ padding: '16px' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  let statusBg = 'var(--gray-pale)';
                  let statusColor = 'var(--charcoal-light)';
                  if (order.status === 'Pending') { statusBg = '#FFF3CD'; statusColor = '#856404'; }
                  else if (order.status === 'Confirmed') { statusBg = '#E2E3E5'; statusColor = '#383D41'; }
                  else if (order.status === 'Out for Delivery') { statusBg = '#D1ECF1'; statusColor = '#0C5460'; }
                  else if (order.status === 'Delivered') { statusBg = 'var(--green-pale)'; statusColor = 'var(--green-deep)'; }
                  else if (order.status === 'Cancelled') { statusBg = '#F8D7DA'; statusColor = '#721C24'; }

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--gray-pale)', transition: 'background 150ms' }}>
                      <td style={{ padding: '16px', fontWeight: '700', color: 'var(--green-primary)' }}>{order.id}</td>
                      <td style={{ padding: '16px', color: 'var(--charcoal-light)', whiteSpace: 'nowrap' }}>{order.date}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '700' }}>{order.name}</div>
                        <div style={{ color: 'var(--gray-medium)', fontSize: '0.75rem' }}>📞 {order.phone}</div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--charcoal-light)', fontWeight: '500' }}>{order.items}</td>
                      <td style={{ padding: '16px', fontWeight: '800', fontSize: '0.95rem' }}>₹{order.total}</td>
                      <td style={{ padding: '16px', color: 'var(--charcoal-light)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.address}>
                        {order.address}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            border: '1px solid var(--gray-light)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            color: statusColor,
                            background: statusBg,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pending" style={{ background: 'white', color: 'black' }}>Pending</option>
                          <option value="Confirmed" style={{ background: 'white', color: 'black' }}>Confirmed</option>
                          <option value="Out for Delivery" style={{ background: 'white', color: 'black' }}>Out for Delivery</option>
                          <option value="Delivered" style={{ background: 'white', color: 'black' }}>Delivered</option>
                          <option value="Cancelled" style={{ background: 'white', color: 'black' }}>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

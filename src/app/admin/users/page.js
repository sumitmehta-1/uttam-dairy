'use client';

import React from 'react';

// Seeding Mock Customers
const CUSTOMERS = [
  { id: 'USR-001', name: 'Uttam Kumar (Admin)', phone: '9999999999', address: 'Uttam Dairy Shop, Main Market Road', role: 'admin', ordersCount: 0, subscription: 'None', dateJoined: '01 July 2026' },
  { id: 'USR-002', name: 'Aarav Sharma', phone: '9876543210', address: 'Dwarka Sector 12, Flat 104, Block-B, New Delhi', role: 'user', ordersCount: 14, subscription: 'Daily Milk (1L)', dateJoined: '02 July 2026' },
  { id: 'USR-003', name: 'Pooja Patel', phone: '9988776655', address: 'Dwarka Sector 10, Pocket 2, House 14, New Delhi', role: 'user', ordersCount: 9, subscription: 'None', dateJoined: '03 July 2026' },
  { id: 'USR-004', name: 'Vikram Singh', phone: '9123456789', address: 'Dwarka Sector 4, DDA Flats, Pocket-Q, New Delhi', role: 'user', ordersCount: 22, subscription: 'Alternate Milk (500ml)', dateJoined: '03 July 2026' },
  { id: 'USR-005', name: 'Neha Gupta', phone: '9345678901', address: 'Dwarka Sector 22, Rose Apartments, Block-D, New Delhi', role: 'user', ordersCount: 6, subscription: 'None', dateJoined: '05 July 2026' }
];

export default function AdminUsers() {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--charcoal)', fontSize: '2rem', fontWeight: '800' }}>Registered Users</h1>
        <p style={{ color: 'var(--gray-medium)', fontSize: '0.88rem' }}>View registered user accounts, contact details, delivery addresses, and monthly subscriptions.</p>
      </div>

      {/* Table grid */}
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
                <th style={{ padding: '16px' }}>User ID</th>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Mobile Number</th>
                <th style={{ padding: '16px' }}>Saved Delivery Address</th>
                <th style={{ padding: '16px' }}>Role</th>
                <th style={{ padding: '16px' }}>Monthly Orders</th>
                <th style={{ padding: '16px' }}>Active Subscription</th>
                <th style={{ padding: '16px' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--gray-pale)', transition: 'background 150ms' }}>
                  <td style={{ padding: '16px', fontWeight: '700', color: 'var(--green-primary)' }}>{c.id}</td>
                  <td style={{ padding: '16px', fontWeight: '700', color: 'var(--charcoal)' }}>{c.name}</td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>📞 {c.phone}</td>
                  <td style={{ padding: '16px', color: 'var(--charcoal-light)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.address}>
                    {c.address}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      background: c.role === 'admin' ? 'var(--gold-light)' : 'var(--gray-pale)',
                      color: c.role === 'admin' ? 'var(--gold-dark)' : 'var(--charcoal-light)'
                    }}>
                      {c.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '800', textAlign: 'center' }}>{c.ordersCount}</td>
                  <td style={{ padding: '16px', fontWeight: '600', color: c.subscription !== 'None' ? 'var(--green-primary)' : 'var(--gray-medium)' }}>
                    {c.subscription}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--gray-medium)' }}>{c.dateJoined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

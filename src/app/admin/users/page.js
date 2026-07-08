'use client';

import React, { useState, useEffect } from 'react';
import { dbGetAllProfiles } from '@/lib/db';
export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  // Load registered users from Supabase / localStorage database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await dbGetAllProfiles();
        setUsers(data || []);
      } catch (e) {
        console.error('Error loading registered users:', e);
      }
    };

    loadUsers();
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, []);

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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-medium)', fontWeight: '600' }}>
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                users.map((c) => (
                  <tr key={c.id || c.phone} style={{ borderBottom: '1px solid var(--gray-pale)', transition: 'background 150ms' }}>
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--green-primary)' }}>{c.id || 'N/A'}</td>
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
                        background: c.role === 'admin' ? 'var(--gold-light)' : c.role === 'delivery' ? 'var(--green-pale)' : 'var(--gray-pale)',
                        color: c.role === 'admin' ? 'var(--gold-dark)' : c.role === 'delivery' ? 'var(--green-deep)' : 'var(--charcoal-light)'
                      }}>
                        {c.role ? c.role.toUpperCase() : 'USER'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '800', textAlign: 'center' }}>{c.ordersCount || 0}</td>
                    <td style={{ padding: '16px', fontWeight: '600', color: c.subscription && c.subscription !== 'None' ? 'var(--green-primary)' : 'var(--gray-medium)' }}>
                      {c.subscription || 'None'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--gray-medium)' }}>{c.dateJoined || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

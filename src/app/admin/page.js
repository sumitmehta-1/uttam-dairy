'use client';

import React from 'react';

// Seeding Mock Dashboard Data
const STATS = [
  { label: 'Total Revenue Today', value: '₹4,890', change: '+14% from yesterday', icon: '💰', color: 'var(--green-primary)' },
  { label: 'Active Orders', value: '18 Pending', change: '4 out for delivery', icon: '📦', color: 'var(--gold-primary)' },
  { label: 'Registered Customers', value: '142 Users', change: '+12 this week', icon: '👥', color: '#3498DB' },
  { label: 'Active Subscriptions', value: '38 Households', change: 'Daily morning delivery', icon: '📅', color: '#9B59B6' }
];

const RECENT_ORDERS = [
  { id: 'ORD-9382', name: 'Aarav Sharma', items: 'Cow Milk (1L) x 2, Paneer (200g) x 1', total: 243, status: 'Out for Delivery', time: '10 mins ago' },
  { id: 'ORD-9381', name: 'Pooja Patel', items: 'Desi Cow Ghee (1L) x 1, Claypot Dahi x 1', total: 770, status: 'Pending', time: '24 mins ago' },
  { id: 'ORD-9380', name: 'Vikram Singh', items: 'Table Butter (200g) x 1, Soft Paneer (500g) x 1', total: 370, status: 'Delivered', time: '1 hour ago' },
  { id: 'ORD-9379', name: 'Neha Gupta', items: 'Cow Milk (500ml) x 3', total: 99, status: 'Delivered', time: '2 hours ago' }
];

const TOP_PRODUCTS = [
  { name: 'Uttam Premium Cow Milk (500ml)', sales: '142 units', share: '34%' },
  { name: 'Granular Desi Cow Ghee (1L)', sales: '48 units', share: '24%' },
  { name: 'Fresh Soft Paneer (200g)', sales: '86 units', share: '20%' },
  { name: 'Thick Creamy Set Curd (400g)', sales: '72 units', share: '16%' }
];

export default function AdminDashboard() {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Title block */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--charcoal)', fontSize: '2rem', fontWeight: '800' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--gray-medium)', fontSize: '0.88rem' }}>Welcome back, Ankush. Here is a summary of Uttam Dairy store activity today.</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {STATS.map((stat, idx) => (
          <div key={idx} style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--gray-medium)' }}>{stat.label}</span>
              <span style={{
                fontSize: '1.4rem', width: '40px', height: '40px', background: 'var(--gray-pale)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{stat.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--charcoal)', lineHeight: '1.2' }}>{stat.value}</div>
              <span style={{ fontSize: '0.72rem', color: stat.color, fontWeight: '700' }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Recent Orders log */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--charcoal)' }}>🔔 Recent Orders</h3>
            <a href="/admin/orders" style={{ fontSize: '0.78rem', color: 'var(--green-primary)', fontWeight: '700', textDecoration: 'underline' }}>View All Orders</a>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-pale)', color: 'var(--gray-medium)', fontWeight: '600' }}>
                  <th style={{ padding: '12px 8px' }}>Order ID</th>
                  <th style={{ padding: '12px 8px' }}>Customer</th>
                  <th style={{ padding: '12px 8px' }}>Items Summary</th>
                  <th style={{ padding: '12px 8px' }}>Bill</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => {
                  let statusBg = 'var(--gray-pale)';
                  let statusColor = 'var(--charcoal-light)';
                  if (order.status === 'Pending') { statusBg = '#FFF3CD'; statusColor = '#856404'; }
                  else if (order.status === 'Out for Delivery') { statusBg = '#D1ECF1'; statusColor = '#0C5460'; }
                  else if (order.status === 'Delivered') { statusBg = 'var(--green-pale)'; statusColor = 'var(--green-deep)'; }

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--gray-pale)' }}>
                      <td style={{ padding: '14px 8px', fontWeight: '700', color: 'var(--green-primary)' }}>{order.id}</td>
                      <td style={{ padding: '14px 8px', fontWeight: '600' }}>{order.name}</td>
                      <td style={{ padding: '14px 8px', color: 'var(--charcoal-light)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.items}</td>
                      <td style={{ padding: '14px 8px', fontWeight: '700' }}>₹{order.total}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem',
                          fontWeight: '700', background: statusBg, color: statusColor, textTransform: 'uppercase'
                        }}>{order.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top selling stats */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--charcoal)', marginBottom: '20px' }}>📈 Popular Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {TOP_PRODUCTS.map((prod, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '600' }}>
                  <span style={{ color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{prod.name}</span>
                  <span style={{ color: 'var(--green-primary)' }}>{prod.sales}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--gray-pale)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: prod.share, height: '100%', background: 'var(--green-primary)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

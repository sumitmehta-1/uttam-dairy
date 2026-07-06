'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !user.loggedIn) {
        router.push('/');
      } else if (!isAdmin()) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || !isAdmin()) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--green-soft)',
          borderTopColor: 'var(--green-primary)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          marginBottom: '12px'
        }}></div>
        <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem', fontWeight: '600' }}>Verifying Administrator access...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-pale)' }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--white)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>🐄</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--green-deep)' }}>Uttam Admin</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--gold-dark)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Store Management</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <a href="/admin" style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem', fontWeight: '600', color: 'var(--green-deep)', background: 'var(--green-pale)'
          }}>
            <span>📊</span> Dashboard
          </a>
          <a href="/admin/orders" style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem', fontWeight: '600', color: 'var(--charcoal-light)'
          }}>
            <span>📦</span> Orders Log
          </a>
          <a href="/admin/products" style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem', fontWeight: '600', color: 'var(--charcoal-light)'
          }}>
            <span>🛍️</span> Products List
          </a>
          <a href="/admin/users" style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem', fontWeight: '600', color: 'var(--charcoal-light)'
          }}>
            <span>👥</span> Users Database
          </a>
        </nav>

        <div style={{
          padding: '12px 16px', background: 'var(--cream)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-primary)',
            color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '700', fontSize: '0.8rem'
          }}>
            A
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </span>
            <a href="/" style={{ fontSize: '0.7rem', color: 'var(--green-primary)', fontWeight: '600', textDecoration: 'underline' }}>
              Back to Store ➔
            </a>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

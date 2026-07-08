'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dbStatus, setDbStatus] = useState({ success: null, error: null });

  useEffect(() => {
    if (!loading) {
      if (!user || !user.loggedIn) {
        router.push('/');
      } else if (!isAdmin()) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  // Check database connection status on mount
  useEffect(() => {
    const checkDb = async () => {
      try {
        const response = await fetch('/api/profiles', { credentials: 'include' });
        const result = await response.json().catch(() => ({}));
        setDbStatus(response.ok ? { success: true, error: null } : { success: false, error: result.error || 'Admin database check failed.' });
      } catch (e) {
        setDbStatus({ success: false, error: e.message || 'Admin database check failed.' });
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

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
    <div className="admin-layout" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.8rem' }}>🐄</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--green-deep)', lineHeight: '1.2' }}>Uttam Admin</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--gold-dark)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Store Management</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <Link
            href="/admin"
            className={`admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className={`admin-nav-link ${pathname === '/admin/orders' ? 'active' : ''}`}
          >
            <span>📦</span> Orders Log
          </Link>
          <Link
            href="/admin/products"
            className={`admin-nav-link ${pathname === '/admin/products' ? 'active' : ''}`}
          >
            <span>🛍️</span> Products List
          </Link>
          <Link
            href="/admin/users"
            className={`admin-nav-link ${pathname === '/admin/users' ? 'active' : ''}`}
          >
            <span>👥</span> Users Database
          </Link>
        </nav>

        {/* Database Connection Status Widget */}
        <div style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.72rem',
          fontWeight: '700',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: dbStatus.success === true ? 'var(--green-pale)' : dbStatus.success === false ? '#F8D7DA' : 'var(--gray-pale)',
          border: '1px solid',
          borderColor: dbStatus.success === true ? 'rgba(44,107,70,0.15)' : dbStatus.success === false ? 'rgba(220,53,69,0.15)' : 'rgba(0,0,0,0.04)',
          color: dbStatus.success === true ? 'var(--green-deep)' : dbStatus.success === false ? '#721C24' : 'var(--charcoal-light)',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dbStatus.success === true ? 'var(--success)' : dbStatus.success === false ? 'var(--danger)' : 'var(--gold-primary)',
              display: 'inline-block'
            }}></span>
            <span>
              {dbStatus.success === true ? 'Supabase Sync Active' : dbStatus.success === false ? 'Database Offline' : 'Verifying Sync...'}
            </span>
          </div>
          {dbStatus.success === false && (
            <div style={{ fontSize: '0.62rem', fontWeight: '500', color: '#842029', lineHeight: '1.2', marginTop: '2px', wordBreak: 'break-word' }}>
              ⚠️ {dbStatus.error}
            </div>
          )}
        </div>

        <div className="admin-profile-box" style={{
          padding: '12px 16px', background: 'var(--cream)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-primary)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </span>
            <Link href="/" style={{ fontSize: '0.7rem', color: 'var(--green-primary)', fontWeight: '600', textDecoration: 'underline' }}>
              Back to Store ➔
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

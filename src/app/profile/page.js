'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import LocationPicker from '@/components/LocationPicker';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, updateLocation } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!loading && (!user || !user.loggedIn)) {
      router.push('/');
      showToast('Please login to view profile details', 'error');
    } else if (user) {
      setName(user.name || '');
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user, loading, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!address.trim()) {
      showToast('Address is required', 'error');
      return;
    }

    // Call updateLocation to save details
    updateLocation(address, user.latitude, user.longitude);
    
    // We can simulate name save by updating localStorage directly (AuthContext updates from localStorage)
    const updatedUser = { ...user, name, address };
    localStorage.setItem('uttam_dairy_user', JSON.stringify(updatedUser));
    
    showToast('Profile updated successfully!', 'success');
  };

  if (loading || !user || !user.loggedIn) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
        fontFamily: 'var(--font-body)'
      }}>
        Loading...
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

      <main className="main-content" style={{ padding: '40px 24px', paddingTop: 'calc(var(--nav-height) + 30px)', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--green-primary)',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          ← Back to Shop
        </Link>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
            👤 My Profile Settings
          </h1>
          <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem' }}>
            Manage your personal details, delivery addresses, and mobile number.
          </p>
        </div>

        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(0,0,0,0.06)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">Registered Mobile Number</label>
              <input
                id="profile-phone"
                type="text"
                className="form-input"
                value={phone}
                disabled
                style={{ background: 'var(--gray-pale)', cursor: 'not-allowed', color: 'var(--gray-medium)' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-medium)', marginTop: '4px', display: 'block' }}>
                💡 Mobile number cannot be modified. Contact support if you need to transfer accounts.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-address">Saved Delivery Address</label>
              <textarea
                id="profile-address"
                className="form-input"
                style={{ height: '90px', padding: '10px', resize: 'vertical' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="form-submit" style={{ flex: 1 }}>
                Save Profile Changes
              </button>
              <a href="/orders" style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--green-primary)',
                color: 'var(--green-primary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '0.95rem'
              }}>
                View Orders Log
              </a>
            </div>
          </form>
        </div>
      </main>

      {/* MODALS */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LocationPicker isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

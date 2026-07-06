'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Navbar({ onOpenLogin, onOpenCart, onOpenLocation, onSearch }) {
  const { getCartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'inherit', textDecoration: 'none' }}>
          <div className="nav-logo">🐄</div>
          <div className="nav-brand">
            <span className="nav-brand-name">Uttam Dairy</span>
            <span className="nav-brand-tagline">Farm Fresh Goodness</span>
          </div>
        </Link>

        {/* Location display Zomato-style */}
        <div className="nav-location" onClick={onOpenLocation}>
          <span className="nav-location-icon">📍</span>
          <div className="nav-location-text">
            <span className="nav-location-label">Delivering to</span>
            <span className="nav-location-value">
              {user && user.loggedIn ? user.address : 'Select Location'}
            </span>
          </div>
          <span className="nav-location-arrow">▼</span>
        </div>
      </div>

      <div className="nav-center">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for milk, ghee, paneer, ice cream..."
            value={searchVal}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="nav-right">
        {user && user.loggedIn ? (
          <div className="nav-profile">
            <div className="nav-profile-btn" onClick={toggleDropdown}>
              <div className="nav-profile-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="nav-profile-name">{user.name.split(' ')[0]}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </div>

            <div className={`profile-dropdown ${dropdownOpen ? 'open' : ''}`}>
              {isAdmin() && (
                <a href="/admin" className="profile-dropdown-item" style={{ fontWeight: '600', color: 'var(--green-primary)' }}>
                  📊 Admin Panel
                </a>
              )}
              <a href="/orders" className="profile-dropdown-item">📦 My Orders</a>
              <a href="/profile" className="profile-dropdown-item">👤 Profile Settings</a>
              <div className="profile-dropdown-item danger" onClick={handleLogout}>
                🚪 Logout
              </div>
            </div>
          </div>
        ) : (
          <button className="nav-btn nav-btn-login" onClick={onOpenLogin}>
            <span className="btn-icon">👤</span>
            <span className="btn-text">Login / Signup</span>
          </button>
        )}

        <button className="nav-btn nav-btn-cart" onClick={onOpenCart}>
          <span className="btn-icon">🛒</span>
          <span className="btn-text">Cart</span>
          {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
        </button>
      </div>
    </nav>
  );
}

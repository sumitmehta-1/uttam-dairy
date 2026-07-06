'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

export default function LoginModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validatePhone = (num) => {
    return /^[6-9]\d{9}$/.test(num); // Standard 10 digit Indian mobile numbers
  };

  const handleLocateMe = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        setTimeout(() => {
          setAddress(`Detected Location (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setLocating(false);
          showToast('GPS Coordinates recorded successfully!', 'success');
        }, 1500);
      },
      (error) => {
        console.error('Error fetching location:', error);
        setTimeout(() => {
          setAddress('Dwarka Main Market Area, New Delhi');
          setLatitude(28.5921);
          setLongitude(77.0628);
          setLocating(false);
          showToast('GPS failed. Set to nearby default coordinates.', 'info');
        }, 1500);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!phone) newErrors.phone = 'Mobile number is required';
    else if (!validatePhone(phone)) newErrors.phone = 'Please enter a valid 10-digit mobile number';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long';

    if (mode === 'signup') {
      if (!name) newErrors.name = 'Full name is required';
      if (!address) newErrors.address = 'Address/location is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct form errors', 'error');
      return;
    }

    try {
      if (mode === 'login') {
        const result = await login(phone, password);
        if (result.success) {
          showToast(`Welcome back, ${result.user.name}!`, 'success');
          onClose();
        } else {
          showToast('Invalid credentials', 'error');
        }
      } else {
        const result = await signup(name, phone, password, address, latitude, longitude);
        if (result.success) {
          showToast('Account created successfully!', 'success');
          onClose();
        } else {
          showToast('Failed to create account', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred. Please try again.', 'error');
    }
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <div className="modal-header-icon">🐄</div>
          <h2>{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Log in to manage orders, subscriptions, and track delivery.' : 'Sign up to order farm-fresh dairy and track deliveries.'}</p>
        </div>
        <div className="modal-body">
          {/* Navigation Tabs for Login / Signup */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--gray-pale)', marginBottom: '24px' }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '0.95rem',
                color: mode === 'login' ? 'var(--green-deep)' : 'var(--gray-medium)',
                borderBottom: mode === 'login' ? '3px solid var(--green-primary)' : '3px solid transparent',
                transition: 'all 200ms'
              }}
              onClick={() => { setMode('login'); setErrors({}); }}
            >
              Login
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '0.95rem',
                color: mode === 'signup' ? 'var(--green-deep)' : 'var(--gray-medium)',
                borderBottom: mode === 'signup' ? '3px solid var(--green-primary)' : '3px solid transparent',
                transition: 'all 200ms'
              }}
              onClick={() => { setMode('signup'); setErrors({}); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {errors.name && <span className="form-error visible">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Mobile Number</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {errors.phone && <span className="form-error visible">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && <span className="form-error visible">{errors.password}</span>}
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-address">Delivery Address / Location</label>
                <div className="form-input-group">
                  <input
                    id="signup-address"
                    type="text"
                    className="form-input"
                    placeholder="Locality, house/flat no..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={`locate-btn ${locating ? 'loading' : ''}`}
                    onClick={handleLocateMe}
                  >
                    <span className="spinner"></span>
                    <span className="locate-icon">🎯</span>
                    <span className="locate-text">Locate Me</span>
                  </button>
                </div>
                {errors.address && <span className="form-error visible">{errors.address}</span>}
              </div>
            )}

            <button type="submit" className="form-submit">
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="form-divider">OR</div>

          <div style={{ textAlign: 'center', fontSize: '0.88rem' }}>
            {mode === 'login' ? (
              <p>
                New to Uttam Dairy?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--green-primary)', fontWeight: '600', textDecoration: 'underline' }}
                  onClick={handleSwitchMode}
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--green-primary)', fontWeight: '600', textDecoration: 'underline' }}
                  onClick={handleSwitchMode}
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

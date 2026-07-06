'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

export default function LocationPicker({ isOpen, onClose }) {
  const { updateLocation } = useAuth();
  const { showToast } = useToast();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLocateMe = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Mocking address based on GPS coordinates for testing
        setTimeout(() => {
          const mockAddress = `Uttam Dairy Hub, Sectors 4, Dwarka, Delhi (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setAddress(mockAddress);
          setLoading(false);
          showToast('Location detected successfully!', 'success');
        }, 1500);
      },
      (error) => {
        console.error('Error fetching location:', error);
        // Fallback to a mock location for sandbox environments
        setTimeout(() => {
          const mockFallback = 'Dwarka Sector 12 Metro Station Area, New Delhi';
          setAddress(mockFallback);
          setLoading(false);
          showToast('GPS failed. Loaded nearby default location.', 'info');
        }, 1500);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      showToast('Please enter an address or click "Locate Me"', 'error');
      return;
    }

    updateLocation(address, 28.6139, 77.2090); // default Delhi coordinates for fallback
    showToast('Delivery address updated!', 'success');
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: '24px' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <div className="modal-header-icon">📍</div>
          <h2>Set Delivery Location</h2>
          <p>Enter your location details to find delivery times and check store coverage.</p>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="address-input">Delivery Address</label>
              <div className="form-input-group">
                <input
                  id="address-input"
                  type="text"
                  className="form-input"
                  placeholder="Enter flat no, street, locality..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={`locate-btn ${loading ? 'loading' : ''}`}
                  onClick={handleLocateMe}
                >
                  <span className="spinner"></span>
                  <span className="locate-icon">🎯</span>
                  <span className="locate-text">Locate Me</span>
                </button>
              </div>
            </div>

            <button type="submit" className="form-submit" style={{ marginTop: '24px' }}>
              Confirm Location
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

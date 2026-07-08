'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

const DEFAULT_LOCATION = {
  latitude: 28.5921,
  longitude: 77.0628,
  address: 'Dwarka Main Market Area, New Delhi'
};

export default function LocationPicker({ isOpen, onClose }) {
  const { user, updateLocation } = useAuth();
  const { showToast } = useToast();
  const [address, setAddress] = useState(user?.address || DEFAULT_LOCATION.address);
  const [latitude, setLatitude] = useState(user?.latitude || DEFAULT_LOCATION.latitude);
  const [longitude, setLongitude] = useState(user?.longitude || DEFAULT_LOCATION.longitude);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const roundedLat = Number(latitude).toFixed(5);
  const roundedLng = Number(longitude).toFixed(5);
  const mapUrl = `https://maps.google.com/maps?q=${roundedLat},${roundedLng}&z=17&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${roundedLat},${roundedLng}`;

  const setPoint = (nextLatitude, nextLongitude, nextAddress = address) => {
    const safeLat = Number(nextLatitude);
    const safeLng = Number(nextLongitude);
    if (Number.isNaN(safeLat) || Number.isNaN(safeLng)) return;

    setLatitude(Number(safeLat.toFixed(6)));
    setLongitude(Number(safeLng.toFixed(6)));
    setAddress(nextAddress);
  };

  const movePoint = (latDelta, lngDelta) => {
    setPoint(Number(latitude) + latDelta, Number(longitude) + lngDelta);
  };

  const handleLocateMe = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      showToast('GPS is not supported. Adjust the pin manually.', 'error');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: detectedLat, longitude: detectedLng } = position.coords;
        setPoint(
          detectedLat,
          detectedLng,
          `Selected location near GPS point (${detectedLat.toFixed(5)}, ${detectedLng.toFixed(5)})`
        );
        setLoading(false);
        showToast('Location detected. Adjust the pin if needed.', 'success');
      },
      (error) => {
        console.error('Error fetching location:', error);
        setPoint(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.address);
        setLoading(false);
        showToast('GPS failed. Map opened at Dwarka; move the pin manually.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      showToast('Please enter delivery address details', 'error');
      return;
    }

    const fullAddress = `${address.trim()} (GPS: ${roundedLat}, ${roundedLng})`;
    updateLocation(fullAddress, Number(latitude), Number(longitude));
    showToast('Delivery location updated!', 'success');
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: '24px', maxWidth: '720px' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <div className="modal-header-icon">Map</div>
          <h2>Choose Delivery Location</h2>
          <p>Detect your GPS point, adjust it, and save the exact delivery address.</p>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div style={{ border: '1px solid var(--gray-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--cream)', marginBottom: '16px' }}>
              <iframe
                title="Selected delivery location map"
                src={mapUrl}
                width="100%"
                height="260"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                type="button"
                className={`locate-btn ${loading ? 'loading' : ''}`}
                onClick={handleLocateMe}
                style={{ minHeight: '40px' }}
              >
                <span className="spinner"></span>
                <span className="locate-text">{loading ? 'Detecting...' : 'Detect My Location'}</span>
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                style={{ minHeight: '40px', display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-light)', color: 'var(--green-primary)', fontWeight: '800', textDecoration: 'none' }}
              >
                Open in Google Maps
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <button type="button" onClick={() => movePoint(0.001, 0)} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-light)', fontWeight: '800' }}>Move North</button>
              <button type="button" onClick={() => movePoint(-0.001, 0)} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-light)', fontWeight: '800' }}>Move South</button>
              <button type="button" onClick={() => movePoint(0, -0.001)} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-light)', fontWeight: '800' }}>Move West</button>
              <button type="button" onClick={() => movePoint(0, 0.001)} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-light)', fontWeight: '800' }}>Move East</button>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label" htmlFor="latitude-input">Latitude</label>
                <input
                  id="latitude-input"
                  type="number"
                  step="0.000001"
                  className="form-input"
                  value={latitude}
                  onChange={(e) => setPoint(e.target.value, longitude)}
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label" htmlFor="longitude-input">Longitude</label>
                <input
                  id="longitude-input"
                  type="number"
                  step="0.000001"
                  className="form-input"
                  value={longitude}
                  onChange={(e) => setPoint(latitude, e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address-input">Delivery Address</label>
              <textarea
                id="address-input"
                className="form-input"
                rows="3"
                placeholder="House/flat no, street, landmark, locality..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="form-submit" style={{ marginTop: '12px' }}>
              Confirm This Location
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

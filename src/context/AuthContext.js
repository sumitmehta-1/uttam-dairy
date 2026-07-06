'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('uttam_dairy_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    // Simulated Login
    // Default admin test credentials
    if (phone === '9999999999' && password === 'admin123') {
      const adminUser = {
        name: 'Uttam Kumar (Admin)',
        phone: '9999999999',
        address: 'Uttam Dairy Shop, Main Market Road',
        latitude: 28.6139,
        longitude: 77.2090,
        role: 'admin',
        loggedIn: true
      };
      setUser(adminUser);
      localStorage.setItem('uttam_dairy_user', JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    // Default standard user test credentials or new users
    const mockUser = {
      name: 'Test Customer',
      phone: phone,
      address: 'Pocket 4, Sector 2, Dwarka, New Delhi',
      latitude: 28.5921,
      longitude: 77.0628,
      role: 'user',
      loggedIn: true
    };
    setUser(mockUser);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const signup = async (name, phone, password, address, latitude, longitude) => {
    const newUser = {
      name,
      phone,
      address: address || 'No address set',
      latitude: latitude || null,
      longitude: longitude || null,
      role: 'user',
      loggedIn: true
    };
    setUser(newUser);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uttam_dairy_user');
  };

  const updateLocation = (address, latitude, longitude) => {
    if (!user) return;
    const updated = { ...user, address, latitude, longitude };
    setUser(updated);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(updated));
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateLocation,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

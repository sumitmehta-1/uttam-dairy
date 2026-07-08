'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount and verify session
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/session', { credentials: 'include' });
        const result = await response.json();
        if (response.ok && result.user) {
          setUser(result.user);
          localStorage.setItem('uttam_dairy_user', JSON.stringify(result.user));
        } else {
          setUser(null);
          localStorage.removeItem('uttam_dairy_user');
        }
      } catch (e) {
        console.error('Error verifying session:', e);
        setUser(null);
        localStorage.removeItem('uttam_dairy_user');
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (phone, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone, password })
    });
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Login failed.' };
    }

    setUser(result.user);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(result.user));
    return { success: true, user: result.user };
  };

  const signup = async (name, phone, password, address, latitude, longitude) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, phone, password, address, latitude, longitude })
    });
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Could not create account.' };
    }

    setUser(result.user);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(result.user));
    return { success: true, user: result.user };
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(console.error);
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

  const isDelivery = () => {
    return user && user.role === 'delivery';
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
        isAdmin,
        isDelivery
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

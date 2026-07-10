'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbGetProfile, dbCreateProfile } from '@/lib/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('uttam_dairy_user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch (e) {
      console.error('Error loading saved user:', e);
      setUser(null);
      localStorage.removeItem('uttam_dairy_user');
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const dbUser = await dbGetProfile(phone);

    if (!dbUser) {
      return { success: false, error: 'User does not exist. Please sign up.' };
    }

    if (dbUser.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    const sessionUser = {
      name: dbUser.name,
      phone: dbUser.phone,
      address: dbUser.address,
      role: dbUser.role,
      latitude: dbUser.latitude,
      longitude: dbUser.longitude,
      loggedIn: true
    };

    setUser(sessionUser);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  };

  const signup = async (name, phone, password, address, latitude, longitude) => {
    const existing = await dbGetProfile(phone);
    if (existing) {
      return { success: false, error: 'Mobile number already registered.' };
    }

    const newProfile = await dbCreateProfile({
      name,
      phone,
      password,
      address: address || 'No address set',
      latitude,
      longitude
    });

    if (!newProfile) {
      return { success: false, error: 'Could not create account. Please try again.' };
    }

    const sessionUser = {
      name: newProfile.name,
      phone: newProfile.phone,
      address: newProfile.address,
      role: newProfile.role,
      latitude: newProfile.latitude,
      longitude: newProfile.longitude,
      loggedIn: true
    };

    setUser(sessionUser);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
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

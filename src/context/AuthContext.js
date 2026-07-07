'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbGetProfile, dbCreateProfile } from '@/lib/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount and verify session
  useEffect(() => {
    const verifySession = async () => {
      try {
        const savedUser = localStorage.getItem('uttam_dairy_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Re-verify user role directly against database to prevent localStorage tampering
          const dbUser = await dbGetProfile(parsedUser.phone);
          if (dbUser && dbUser.role === parsedUser.role) {
            setUser({ ...dbUser, loggedIn: true });
            localStorage.setItem('uttam_dairy_user', JSON.stringify({ ...dbUser, loggedIn: true }));
          } else {
            // Local role mismatch or tampered, clear session
            setUser(null);
            localStorage.removeItem('uttam_dairy_user');
          }
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
    // 1. Query user profile from database (Supabase with localStorage fallback)
    const dbUser = await dbGetProfile(phone);

    if (!dbUser) {
      return { success: false, error: 'User does not exist. Please sign up.' };
    }

    // 2. Securely match password
    if (dbUser.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    // 3. Create logged in session
    const sessionUser = {
      name: dbUser.name,
      phone: dbUser.phone,
      address: dbUser.address,
      role: dbUser.role,
      loggedIn: true
    };

    setUser(sessionUser);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  };

  const signup = async (name, phone, password, address, latitude, longitude) => {
    // Check if user already exists
    const existing = await dbGetProfile(phone);
    if (existing) {
      return { success: false, error: 'Mobile number already registered.' };
    }

    // Create user profile in database
    const newProfile = await dbCreateProfile({
      name,
      phone,
      password,
      address: address || 'No address set',
      latitude,
      longitude
    });

    const sessionUser = {
      name: newProfile.name,
      phone: newProfile.phone,
      address: newProfile.address,
      role: newProfile.role,
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

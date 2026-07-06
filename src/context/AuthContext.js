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

      // Initialize registered users list if empty
      const existingUsers = localStorage.getItem('uttam_registered_users');
      if (!existingUsers) {
        const seedUsers = [
          { id: 'USR-001', name: 'Ankush (Admin)', phone: '9050644622', address: 'Uttam Dairy Shop, Main Market Road', role: 'admin', ordersCount: 0, subscription: 'None', dateJoined: '01 July 2026' },
          { id: 'USR-002', name: 'Aarav Sharma', phone: '9876543210', address: 'Dwarka Sector 12, Flat 104, Block-B, New Delhi', role: 'user', ordersCount: 14, subscription: 'Daily Milk (1L)', dateJoined: '02 July 2026' },
          { id: 'USR-003', name: 'Pooja Patel', phone: '9988776655', address: 'Dwarka Sector 10, Pocket 2, House 14, New Delhi', role: 'user', ordersCount: 9, subscription: 'None', dateJoined: '03 July 2026' },
          { id: 'USR-004', name: 'Vikram Singh', phone: '9123456789', address: 'Dwarka Sector 4, DDA Flats, Pocket-Q, New Delhi', role: 'user', ordersCount: 22, subscription: 'Alternate Milk (500ml)', dateJoined: '03 July 2026' },
          { id: 'USR-005', name: 'Neha Gupta', phone: '9345678901', address: 'Dwarka Sector 22, Rose Apartments, Block-D, New Delhi', role: 'user', ordersCount: 6, subscription: 'None', dateJoined: '05 July 2026' },
          { id: 'USR-006', name: 'Delivery Partner', phone: '9050644621', address: 'Uttam Dairy Delivery Hub', role: 'delivery', ordersCount: 0, subscription: 'None', dateJoined: '06 July 2026' }
        ];
        localStorage.setItem('uttam_registered_users', JSON.stringify(seedUsers));
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    // Admin credentials — Ankush (Owner)
    if (phone === '9050644622' && password === 'dairy823@*') {
      const adminUser = {
        name: 'Ankush',
        phone: '9050644622',
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

    // Delivery Boy credentials
    if (phone === '9050644621' && password === 'dairy823@*') {
      const deliveryUser = {
        name: 'Delivery Partner',
        phone: '9050644621',
        address: 'Uttam Dairy Delivery Hub',
        latitude: 28.6139,
        longitude: 77.2090,
        role: 'delivery',
        loggedIn: true
      };
      setUser(deliveryUser);
      localStorage.setItem('uttam_dairy_user', JSON.stringify(deliveryUser));
      return { success: true, user: deliveryUser };
    }

    // Default standard user — load their registered name and address from database
    let registeredUser = null;
    let existingUsers = [];
    try {
      existingUsers = JSON.parse(localStorage.getItem('uttam_registered_users') || '[]');
      registeredUser = existingUsers.find(u => u.phone === phone);
    } catch(e) {
      console.error('Error loading users database for login:', e);
    }

    const nameToUse = registeredUser ? registeredUser.name : 'Test Customer';
    const addressToUse = registeredUser ? registeredUser.address : 'Pocket 4, Sector 2, Dwarka, New Delhi';
    const roleToUse = registeredUser ? registeredUser.role : 'user';

    const loggedUser = {
      name: nameToUse,
      phone: phone,
      address: addressToUse,
      latitude: registeredUser ? registeredUser.latitude : 28.5921,
      longitude: registeredUser ? registeredUser.longitude : 77.0628,
      role: roleToUse,
      loggedIn: true
    };

    // If it's a completely new login and not in the users database, add it
    if (!registeredUser) {
      try {
        existingUsers.push({
          id: `USR-${Math.floor(100 + Math.random() * 900)}`,
          name: nameToUse,
          phone: phone,
          address: addressToUse,
          role: roleToUse,
          ordersCount: 0,
          subscription: 'None',
          dateJoined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        });
        localStorage.setItem('uttam_registered_users', JSON.stringify(existingUsers));
      } catch(e) {
        console.error('Error writing new fallback user:', e);
      }
    }

    setUser(loggedUser);
    localStorage.setItem('uttam_dairy_user', JSON.stringify(loggedUser));
    return { success: true, user: loggedUser };
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

    // Add to all registered users list in localStorage
    try {
      const existingUsers = JSON.parse(localStorage.getItem('uttam_registered_users') || '[]');
      if (!existingUsers.some(u => u.phone === phone)) {
        existingUsers.push({
          id: `USR-${Math.floor(100 + Math.random() * 900)}`,
          name,
          phone,
          address: address || 'No address set',
          role: 'user',
          ordersCount: 0,
          subscription: 'None',
          dateJoined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        });
        localStorage.setItem('uttam_registered_users', JSON.stringify(existingUsers));
      }
    } catch(e) {
      console.error('Error writing to registered users list:', e);
    }

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

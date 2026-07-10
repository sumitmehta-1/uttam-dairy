import { supabase } from './supabase';
import { PRODUCTS } from './products';

// Helper to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && url !== '' && key !== 'your-public-anon-key-here' && key !== 'sb_publishable_zCKw3Jniil8-DhOGuJI7ag_TrOQkKHv_placeholder';
};

const MAX_ORDER_TOTAL = 1000;
const isBrowser = () => false;

const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'Request failed.');
  }
  return result;
};

const toAppProfile = (profile) => {
  if (!profile) return null;
  return {
    ...profile,
    ordersCount: profile.orders_count ?? profile.ordersCount ?? 0,
    subscription: profile.subscription ?? 'None',
    dateJoined: profile.date_joined || profile.dateJoined || (
      profile.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'N/A'
    )
  };
};

const toAppOrder = (order) => {
  if (!order) return null;
  return {
    ...order,
    deliveryFee: Number(order.delivery_fee ?? order.deliveryFee ?? 0),
    handlingFee: Number(order.handling_fee ?? order.handlingFee ?? 0),
    paymentMethod: order.payment_method || order.paymentMethod,
    subtotal: Number(order.subtotal ?? 0),
    total: Number(order.total ?? 0)
  };
};

const toAppProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    deliveryTime: product.delivery_time || product.deliveryTime || '10 mins',
    inStock: product.in_stock ?? product.inStock ?? true
  };
};

// Default seed profiles (admin + delivery + demo users)
const SEED_PROFILES = [
  { id: 'USR-001', name: 'Ankush', phone: '9050644622', password: 'dairy823@*', address: 'Uttam Dairy Shop, Main Market Road', role: 'admin', ordersCount: 0, subscription: 'None', dateJoined: '01 July 2026' },
  { id: 'USR-002', name: 'Delivery Partner', phone: '9050644621', password: 'dairy823@*', address: 'Uttam Dairy Delivery Hub', role: 'delivery', ordersCount: 0, subscription: 'None', dateJoined: '01 July 2026' },
  { id: 'USR-003', name: 'Aarav Sharma', phone: '9876543210', password: 'password123', address: 'Dwarka Sector 12, Flat 104, Block-B, New Delhi', role: 'user', ordersCount: 14, subscription: 'Daily Milk (1L)', dateJoined: '02 July 2026' },
  { id: 'USR-004', name: 'Pooja Patel', phone: '9988776655', password: 'password123', address: 'Dwarka Sector 10, Pocket 2, House 14, New Delhi', role: 'user', ordersCount: 9, subscription: 'None', dateJoined: '03 July 2026' },
  { id: 'USR-005', name: 'Vikram Singh', phone: '9123456789', password: 'password123', address: 'Dwarka Sector 4, DDA Flats, Pocket-Q, New Delhi', role: 'user', ordersCount: 22, subscription: 'Alternate Milk (500ml)', dateJoined: '03 July 2026' }
];

// Ensure seed profiles exist in localStorage
const ensureSeedProfiles = () => {
  try {
    const existing = localStorage.getItem('uttam_registered_users');
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem('uttam_registered_users', JSON.stringify(SEED_PROFILES));
      return SEED_PROFILES;
    }
    return JSON.parse(existing);
  } catch (e) {
    localStorage.setItem('uttam_registered_users', JSON.stringify(SEED_PROFILES));
    return SEED_PROFILES;
  }
};

// ============================================
// DIAGNOSTIC CONNECTION CHECK
// ============================================

export const dbCheckConnection = async () => {
  if (isBrowser()) {
    try {
      await apiFetch('/api/profiles');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Admin database check failed.' };
    }
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set in Vercel settings.' };
  }
  try {
    const { data, error } = await supabase.from('profiles').select('phone').limit(1);
    if (error) {
      return { success: false, error: `Supabase query error (Code ${error.code}): ${error.message}. Run fix_rls.sql in Supabase SQL Editor.` };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: `Connection failed: ${e.message}` };
  }
};

// ============================================
// USERS / PROFILES METHODS
// ============================================

export const dbGetProfile = async (phone) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (error) {
        console.error('Supabase dbGetProfile error:', error.message, error.details);
      } else if (data) {
        return toAppProfile(data);
      }
    } catch (e) {
      console.error('Supabase profile check failed, falling back to local database.', e);
    }
  }

  // Fallback to localStorage (with auto-seeding)
  const localUsers = ensureSeedProfiles();
  return localUsers.find(u => u.phone === phone) || null;
};

export const dbCreateProfile = async (profileData) => {
  const { name, phone, password, address } = profileData;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ phone, password, name, address, role: 'user' }])
        .select()
        .single();

      if (error) {
        throw new Error(`Could not save user to shared database: ${error.message}`);
      }
      if (data) {
        return toAppProfile(data);
      }
    } catch (e) {
      console.error('Supabase profile insertion failed:', e);
      throw e;
    }
  }

  // Fallback to localStorage
  const localUsers = ensureSeedProfiles();
  if (!localUsers.some(u => u.phone === phone)) {
    const newProfile = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      phone,
      password,
      address: address || 'No address set',
      role: 'user',
      ordersCount: 0,
      subscription: 'None',
      dateJoined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    };
    localUsers.push(newProfile);
    localStorage.setItem('uttam_registered_users', JSON.stringify(localUsers));
    return newProfile;
  }
  return localUsers.find(u => u.phone === phone);
};

export const dbGetAllProfiles = async () => {
  if (isBrowser()) {
    const result = await apiFetch('/api/profiles');
    return (result.profiles || []).map(toAppProfile);
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase dbGetAllProfiles error:', error.message, error.details);
      } else if (data) {
        return data.map(toAppProfile);
      }
    } catch (e) {
      console.warn('Supabase get all profiles failed:', e);
    }
  }

  return ensureSeedProfiles();
};


// ============================================
// PRODUCTS METHODS
// ============================================

export const dbGetProducts = async () => {
  if (isBrowser()) {
    try {
      const result = await apiFetch('/api/products');
      if (result.products && result.products.length > 0) {
        return result.products.map(toAppProduct);
      }
    } catch (e) {
      console.warn('Product API failed, falling back to local catalog.', e);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Supabase dbGetProducts error:', error.message, error.details);
      } else if (data && data.length > 0) {
        return data.map(toAppProduct);
      }
    } catch (e) {
      console.warn('Supabase products check failed, falling back to local database.', e);
    }
  }

  // Fallback to localStorage catalog
  const localCatalog = localStorage.getItem('uttam_products_catalog');
  if (localCatalog) {
    return JSON.parse(localCatalog);
  }
  
  // Seed local storage with default products if empty
  localStorage.setItem('uttam_products_catalog', JSON.stringify(PRODUCTS));
  return PRODUCTS;
};

export const dbSaveProduct = async (product) => {
  if (isBrowser()) {
    await apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
    return true;
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('products')
        .upsert([{
          id: product.id,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          mrp: Number(product.mrp),
          weight: product.weight,
          image: product.image,
          delivery_time: product.deliveryTime || '10 mins',
          in_stock: product.inStock,
          description: product.description
        }]);
      
      if (error) {
        console.error('Supabase dbSaveProduct error:', error.message, error.details);
      } else {
        return true;
      }
    } catch (e) {
      console.error('Supabase product save failed:', e);
    }
  }

  // Fallback to localStorage catalog
  const catalog = await dbGetProducts();
  const index = catalog.findIndex(p => p.id === product.id);
  if (index !== -1) {
    catalog[index] = { ...catalog[index], ...product };
  } else {
    catalog.push(product);
  }
  localStorage.setItem('uttam_products_catalog', JSON.stringify(catalog));
  return true;
};

export const dbDeleteProduct = async (productId) => {
  if (isBrowser()) {
    await apiFetch('/api/products', {
      method: 'DELETE',
      body: JSON.stringify({ productId })
    });
    return true;
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        console.error('Supabase dbDeleteProduct error:', error.message, error.details);
      } else {
        return true;
      }
    } catch (e) {
      console.error('Supabase product deletion failed:', e);
    }
  }

  // Fallback to localStorage catalog
  const catalog = await dbGetProducts();
  const updated = catalog.filter(p => p.id !== productId);
  localStorage.setItem('uttam_products_catalog', JSON.stringify(updated));
  return true;
};


// ============================================
// ORDERS METHODS
// ============================================

export const dbGetAllOrders = async () => {
  if (isBrowser()) {
    const result = await apiFetch('/api/orders');
    return (result.orders || []).map(toAppOrder);
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase dbGetAllOrders error:', error.message, error.details);
      } else if (data) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase get orders check failed, falling back to local database.', e);
    }
  }

  return JSON.parse(localStorage.getItem('uttam_orders_history') || '[]');
};

export const dbSaveOrder = async (order) => {
  if (Number(order.total) > MAX_ORDER_TOTAL) {
    throw new Error(`Order total cannot exceed Rs ${MAX_ORDER_TOTAL}.`);
  }

  if (isBrowser()) {
    await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
    return true;
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          id: order.id,
          timestamp: order.timestamp,
          items: order.items,
          subtotal: Number(order.subtotal),
          delivery_fee: Number(order.deliveryFee),
          handling_fee: Number(order.handlingFee),
          total: Number(order.total),
          payment_method: order.paymentMethod,
          address: order.address,
          phone: order.phone,
          name: order.name,
          status: order.status
        }]);

      if (error) {
        throw new Error(`Could not save order to shared database: ${error.message}`);
      }
      return true;
    } catch (e) {
      console.error('Supabase order creation failed:', e);
      throw e;
    }
  }

  // Fallback to localStorage orders list
  const history = JSON.parse(localStorage.getItem('uttam_orders_history') || '[]');
  localStorage.setItem('uttam_orders_history', JSON.stringify([order, ...history]));
  return true;
};

export const dbUpdateOrderStatus = async (orderId, status) => {
  if (isBrowser()) {
    await apiFetch('/api/orders', {
      method: 'PATCH',
      body: JSON.stringify({ orderId, status })
    });
    return true;
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        throw new Error(`Could not update order status in shared database: ${error.message}`);
      }
      return true;
    } catch (e) {
      console.error('Supabase order status update failed:', e);
      throw e;
    }
  }

  // Fallback to localStorage orders history
  const history = JSON.parse(localStorage.getItem('uttam_orders_history') || '[]');
  const updatedHistory = history.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem('uttam_orders_history', JSON.stringify(updatedHistory));

  // Also update active order if active
  const activeOrder = JSON.parse(localStorage.getItem('uttam_active_order') || 'null');
  if (activeOrder && activeOrder.id === orderId) {
    localStorage.setItem('uttam_active_order', JSON.stringify({ ...activeOrder, status }));
  }
  return true;
};

export const dbUpdateOrderItems = async (orderId, items, subtotal, deliveryFee, handlingFee, total) => {
  if (isBrowser()) {
    await apiFetch('/api/orders', {
      method: 'PATCH',
      body: JSON.stringify({ orderId, items, subtotal, deliveryFee, handlingFee, total })
    });
    return true;
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ items, subtotal, delivery_fee: deliveryFee, handling_fee: handlingFee, total })
        .eq('id', orderId);
      
      if (error) {
        throw new Error(`Could not update order items in shared database: ${error.message}`);
      }
      return true;
    } catch (e) {
      console.error('Supabase order items modification failed:', e);
      throw e;
    }
  }

  // Fallback to localStorage orders history
  const history = JSON.parse(localStorage.getItem('uttam_orders_history') || '[]');
  const updatedHistory = history.map(o => {
    if (o.id === orderId) {
      return { ...o, items, subtotal, deliveryFee, handlingFee, total, timestamp: Date.now() };
    }
    return o;
  });
  localStorage.setItem('uttam_orders_history', JSON.stringify(updatedHistory));
  return true;
};

// ============================================
// SELF-HEALING SEEDING FOR DATABASE
// ============================================

export const dbEnsureSupabaseSeeded = async () => {
  if (!isSupabaseConfigured()) return;
  
  try {
    // 1. Seed profiles table if empty
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('phone');
      
    if (!profError && (!profiles || profiles.length === 0)) {
      console.log('Seeding profiles table in Supabase...');
      const seedProfiles = [
        { phone: '9050644622', password: 'dairy823@*', name: 'Ankush', address: 'Uttam Dairy Shop, Main Market Road', role: 'admin' },
        { phone: '9050644621', password: 'dairy823@*', name: 'Delivery Partner', address: 'Uttam Dairy Delivery Hub', role: 'delivery' },
        { phone: '9876543210', password: 'password123', name: 'Aarav Sharma', address: 'Dwarka Sector 12, Flat 104, Block-B, New Delhi', role: 'user' }
      ];
      await supabase.from('profiles').insert(seedProfiles);
    }

    // 2. Seed products table if empty
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id');
      
    if (!prodError && (!products || products.length === 0)) {
      console.log('Seeding products table in Supabase...');
      const dbProducts = PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        mrp: Number(p.mrp),
        weight: p.weight,
        image: p.image,
        delivery_time: p.deliveryTime || '10 mins',
        in_stock: p.inStock,
        description: p.description
      }));
      await supabase.from('products').insert(dbProducts);
    }
  } catch (e) {
    console.error('Self-healing database seeding failed:', e);
  }
};

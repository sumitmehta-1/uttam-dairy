-- ================================================================
-- UTTAM DAIRY - FIX RLS PERMISSIONS (Run this in Supabase SQL Editor)
-- This script fixes the "row-level security policy" error
-- that prevents signups and orders from saving to the database.
-- ================================================================

-- Step 1: Force-disable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing restrictive policies
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;

-- Step 3: Create fully permissive policies (allow ALL operations for everyone)
CREATE POLICY "Allow all access to profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to orders" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Grant table-level permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 5: Add "Out for Delivery" to orders status constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'));

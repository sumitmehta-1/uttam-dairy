-- ================================================================
-- UTTAM DAIRY - LIVE SECURITY RLS SETUP
-- Run this in Supabase SQL Editor before going live.
-- App writes/reads private data through Next.js API routes using
-- SUPABASE_SERVICE_ROLE_KEY. Do NOT expose that key in NEXT_PUBLIC vars.
-- ================================================================

-- Enable RLS on all app tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remove old permissive policies
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Public can read products" ON public.products;

-- Remove broad anonymous permissions
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
REVOKE ALL ON public.orders FROM authenticated;
REVOKE ALL ON public.products FROM authenticated;

-- Public visitors may only read catalog products
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.products TO anon;

CREATE POLICY "Public can read products" ON public.products
  FOR SELECT
  TO anon
  USING (true);

-- Keep order status and value constrained at database level
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_total_limit_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_total_limit_check
  CHECK (total <= 1000);

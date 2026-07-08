-- ================================================================
-- UTTAM DAIRY - PERMISSIVE DATABASE ACCESS FIX
-- Run this in Supabase SQL Editor if signup/login/orders show
-- "permission denied for table profiles/orders/products".
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;

CREATE POLICY "Allow all access to profiles" ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to products" ON public.products
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to orders" ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.products TO anon;
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_total_limit_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_total_limit_check
  CHECK (total <= 1000);

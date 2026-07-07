-- Supabase Database Setup Script for Uttam Dairy
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com) and click RUN.

-- 1. Create PROFILES (Users) table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  address text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'delivery')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) for public access in development
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Seed default admin and delivery accounts
INSERT INTO public.profiles (phone, password, name, address, role)
VALUES 
  ('9050644622', 'dairy823@*', 'Ankush', 'Uttam Dairy Shop, Main Market Road', 'admin'),
  ('9050644621', 'dairy823@*', 'Delivery Partner', 'Uttam Dairy Delivery Hub', 'delivery'),
  ('9876543210', 'password123', 'Aarav Sharma', 'Dwarka Sector 12, Flat 104, Block-B, New Delhi', 'user')
ON CONFLICT (phone) DO UPDATE 
SET password = EXCLUDED.password, name = EXCLUDED.name, address = EXCLUDED.address, role = EXCLUDED.role;


-- 2. Create PRODUCTS table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  mrp numeric NOT NULL,
  weight text NOT NULL,
  image text NOT NULL,
  delivery_time text DEFAULT '10 mins',
  in_stock boolean DEFAULT true,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Seed default catalog
INSERT INTO public.products (id, name, category, price, mrp, weight, image, delivery_time, in_stock, description)
VALUES
  ('prod-milk-500', 'Uttam Premium Cow Milk', 'Milk & Cream', 33, 35, '500 ml', '/milk.jpg', '10 mins', true, 'Farm-fresh pasteurized cow milk. Rich in taste, nutrients, and cream. Ideal for daily tea, coffee, and kids growth.'),
  ('prod-milk-1000', 'Uttam Pure Family Milk', 'Milk & Cream', 64, 66, '1 Litre', '/milk.jpg', '10 mins', true, '1 Litre pack of pasteurized cow milk, delivered fresh within hours of milking. High hygiene guaranteed.'),
  ('prod-ghee-1000', 'Granular Desi Cow Ghee', 'Butter & Ghee', 680, 720, '1 Litre Jar', '/ghee.jpg', '10 mins', true, 'Traditionally churned golden cow ghee. Rich aroma, granular (danedar) texture, and loaded with healthy fats.'),
  ('prod-butter-200', 'Pure White Table Butter', 'Butter & Ghee', 110, 115, '200 g', '/butter.jpg', '10 mins', true, 'Creamy, lightly salted fresh table butter churned from pure cow milk. Perfect spread for warm parathas and toast.'),
  ('prod-paneer-200', 'Fresh Soft Paneer', 'Paneer & Cheese', 115, 125, '200 g', '/paneer.jpg', '10 mins', true, 'Super soft, vacuum-packed cottage cheese. Melt-in-mouth texture, prepared fresh every morning.'),
  ('prod-paneer-500', 'Fresh Soft Paneer (Family Pack)', 'Paneer & Cheese', 260, 290, '500 g', '/paneer.jpg', '10 mins', true, 'Super soft cottage cheese cubes family size. Prepared fresh, zero preservatives, high protein content.'),
  ('prod-curd-400', 'Thick Creamy Set Curd', 'Curd & Yogurt', 40, 45, '400 g Cup', '/curd.jpg', '10 mins', true, 'Thick, creamy set yogurt with a mild, pleasant sourness. High in calcium and good gut bacteria.'),
  ('prod-curd-clay', 'Traditional Claypot Dahi', 'Curd & Yogurt', 90, 100, '800 g Pot', '/curd.jpg', '15 mins', true, 'Curd set in traditional earthenware clay pots. Earthen pots absorb excess water, making it extremely thick, sweet and natural.')
ON CONFLICT (id) DO NOTHING;


-- 3. Create ORDERS table
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  timestamp bigint NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  delivery_fee numeric NOT NULL,
  handling_fee numeric NOT NULL,
  total numeric NOT NULL,
  payment_method text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Delivered', 'Cancelled'))
);

ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

# Implementation Plan - Uttam Dairy Website (Full-Stack)

Build a premium, high-converting, modern single-page website for **Uttam Dairy** with a gorgeous nature, milk, and cow-inspired user interface. It incorporates a Blinkit-style product catalog, real-time search, a category navigation bar, a signup/login flow with location detection, a shopping cart, and advanced dairy features, backed by Next.js and Supabase (PostgreSQL).

## Tech Stack
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Vanilla CSS + CSS Modules
*   **Database:** Supabase (PostgreSQL)
*   **Auth:** Supabase Auth (Phone + Password)
*   **Deployment:** Vercel

---

## Proposed Changes & File Architecture

### 1. Database Schema (Supabase PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INT NOT NULL, -- in paise
  mrp INT NOT NULL, -- in paise
  weight TEXT NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  delivery_time TEXT DEFAULT '10 mins',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders Table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  items JSONB NOT NULL,
  total INT NOT NULL, -- in paise
  delivery_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, out_for_delivery, delivered, cancelled
  payment_method TEXT DEFAULT 'cod',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 2. File Directory Layout

```
uttam-dairy/
├── public/
│   └── assets/           # Product images (hero-bg, milk, ghee, butter, paneer, curd)
├── src/
│   ├── app/
│   │   ├── layout.js           # Root layout (navbar, footer, AuthContext)
│   │   ├── page.js             # Home page (hero, categories, products list, live purity board)
│   │   ├── globals.css         # Design system (imported from style.css)
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.js   # Secure Login page (Phone + Password)
│   │   │   └── signup/page.js  # Secure Signup page (Name, Phone, Password, Location manual/auto)
│   │   │
│   │   ├── cart/
│   │   │   └── page.js         # Full cart review page + Checkout flow
│   │   │
│   │   ├── orders/
│   │   │   └── page.js         # Order history & live status tracking for users
│   │   │
│   │   ├── admin/              # 🔒 Protected Admin Panel (role === 'admin')
│   │   │   ├── layout.js       # Admin navigation sidebar
│   │   │   ├── page.js         # Dashboard statistics & charts
│   │   │   ├── orders/page.js  # Order list management & status updating
│   │   │   ├── products/page.js # Product inventory management (CRUD)
│   │   │   └── users/page.js   # Registered users database
│   │   │
│   │   └── api/                # Secure API routes for orders, products, auth callbacks
│   │
│   ├── components/
│   │   ├── Navbar.js           # Header with location, search, profile, cart count
│   │   ├── CategoryBar.js      # Categories pill horizontal scroll
│   │   ├── ProductCard.js      # Blinkit-style layout with ADD Morph control
│   │   ├── CartDrawer.js       # Sliding Cart Panel
│   │   ├── LocationPicker.js   # GPS/Address locator modal
│   │   └── admin/              # Admin components (StatsCard, OrderTable)
```

---

## Verification Plan
1.  **Build Check:** Run `npm run build` to verify there are no compilation errors.
2.  **Auth & Location Flow:** Test signup, coordinate mapping (mocking location coordinates to address string), and checking that the navbar updates the delivery address correctly.
3.  **Blinkit Add to Cart:** Ensure the "+ ADD" buttons update local context and increment the badge counts in the header.
4.  **Admin Protection:** Try accessing `/admin` as a standard user (should redirect to home or login). Access `/admin` as an administrator (should load stats, orders, and CRUD product tables).

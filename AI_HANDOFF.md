# 🥛 Uttam Dairy — AI Handoff & Instructions

> **Attention Next AI Agent:** Read this document immediately. It contains the exact context, requirements, decisions, and system state of this project so you can pick up where the previous session left off without requiring the user to re-explain anything.

---

## 📌 Project Overview
*   **Project Name:** Uttam Dairy
*   **Goal:** Build a premium, high-converting, full-stack e-commerce website for a local milk and dairy shop that will eventually be deployed to Vercel.
*   **UI/UX Vibe (Strict Command):** Premium design inspired by **cows, milk, and nature**. The user must feel that organic/farm-fresh aesthetic immediately.
    *   *Colors:* Creamy whites (`#FAF6EE`), forest grass greens (`#2C6B46` / `#4E9F6D`), golden ghee/honey highlights (`#E5A93C`), and charcoal text.
    *   *Layout:* Modern, clean, and highly responsive.
*   **Main Features:**
    1.  **Navbar:** Logo + Brand Name + Zomato-style Location display ("Delivering to: [Address] ▾") + Search option + Login/Signup button (if signed out) OR Profile dropdown (if signed in) + Cart icon showing items count.
    2.  **Location Detection:** Zomato-style signup modal requesting Mobile, Name, and Location (with a "Locate Me" GPS auto-detection button).
    3.  **Categories Bar:** Horizontal scrolling filter bar (Milk & Cream, Butter & Ghee, Paneer & Cheese, Curd & Yogurt, Ice Cream, Sweets).
    4.  **Product Catalog (Blinkit-style UI):** Compact product grid. Cards show delivery time badge ("10 mins"), weight, price with strike-through MRP, and a green/white `+ ADD` button that morphs into a `- 1 +` counter when clicked.
    5.  **Admin Panel:** Protected dashboard (`/admin`) where the owner can check the database of orders, view users list, view business statistics, and manage products.
    6.  **Advanced features:** Live milk purity board (Fat %, SNF %, Milking Time) and a daily milk subscription plan builder.

---

## 💻 Current System State (What has been done)
1.  **Node.js & npm installed:**
    *   Node.js version: `v22.16.0` (LTS)
    *   npm version: `10.9.2`
    *   PowerShell script execution policy has been updated to `RemoteSigned` for npm to run correctly.
2.  **Static CSS Created:**
    *   We created a complete theme stylesheet at `style.css`. It contains the complete design system variables, fonts, Blinkit-style animations, modal overlays, card designs, and responsive breakpoints.
3.  **Assets Generated:**
    *   The image generation tool was used to create high-quality assets. They are saved in `assets/`:
        *   `hero-bg.jpg`: Grazing cows on lush green pastures.
        *   `milk.jpg`: Glass milk bottle.
        *   `ghee.jpg`: Golden cow ghee jar.
        *   `butter.jpg`: Table butter block.
        *   `paneer.jpg`: Soft paneer cubes.
        *   `curd.jpg`: Set curd in a clay pot.
        *   *Note:* The remaining categories (Ice cream, Sweets) should use high-quality emoji icons or placeholder SVGs as the image quota was reached.

---

## ⚠️ Critical Blockers & Workarounds for Next Steps

When trying to initialize the Next.js project in the current directory using `create-next-app`, it failed with:
> *Could not create a project called "uttam dairy" because of npm naming restrictions: name can only contain URL-friendly characters (due to space in directory name).*

### 🛠️ Workaround for Next Agent:
1.  Because the desktop directory is named `uttam dairy` (with a space), you cannot initialize Next.js directly inside `./`.
2.  Instead, create the project in a subfolder named `uttam-dairy` (with a hyphen) by running:
    ```powershell
    npx -y create-next-app@latest uttam-dairy --js --no-tailwind --eslint --app --src-dir --use-npm --yes --import-alias "@/*"
    ```
3.  After initialization, move all files out of `uttam-dairy` back up into `C:\Users\DELL\OneDrive\Desktop\uttam dairy` (you'll need to update the `name` in `package.json` to `"uttam-dairy"` with a hyphen so it doesn't complain about the space).
4.  Then copy our existing files (`style.css` and the `assets/` folder) into the correct directories:
    *   `style.css` should override/extend `src/app/globals.css`.
    *   `assets/` should go into the `public/` directory so they are accessible by Next.js at `/assets/filename.jpg`.

---

## 🗄️ Database Setup (Supabase)
To make this app secure and functional with an Admin Panel, use **Supabase (PostgreSQL)**. 
Here is the schema to create on Supabase:

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

---

## 🚀 Execution Guide for Next Agent
1.  Initialize Next.js in a hyphenated subfolder and move files up as described in the Workaround section.
2.  Install Supabase JS client: `npm install @supabase/supabase-js`.
3.  Guide the user to set up a free project on [supabase.com](https://supabase.com) and add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in a `.env.local` file.
4.  Convert `style.css` rules into the global styles and UI components.
5.  Build standard auth states, cart logic, category bars, and the admin dashboard page `/src/app/admin/page.js` with product/order management lists.

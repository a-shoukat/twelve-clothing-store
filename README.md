# Twelve Clothing — Online Store

A complete, mobile-first clothing store for the **Twelve Clothing** brand —
minimal ivory/black fashion aesthetic — with a private admin panel.

**Stack:** React 18 + Vite + Tailwind CSS · Supabase (PostgreSQL + Auth + Storage)

## What it does

**Public store** (no login)
- Home: compact hero, shop-by-category (Men / Women / Kids), Featured, New Arrivals
- Shop: search + filters (category, size, price band)
- Product page: image gallery, size/color selectors, quantity, add to cart
- Cart (persisted in `localStorage`), checkout with Pakistani phone validation
  (`03XXXXXXXXX`), Cash on Delivery
- Order success page with readable Order ID (`ORD-1001`)
- Contact/About page with store WhatsApp + Instagram

**Admin panel** (`/admin`, email + password via Supabase Auth)
- Orders dashboard: newest first, search, status filter, pending badge
- Order detail view + status workflow
  (Pending → Confirmed → Packed → Shipped → Delivered / Cancelled)
- Green **Send WhatsApp Confirmation** button → opens `wa.me` with the
  customer's number (`92XXXXXXXXXX`) and a pre-filled message — you press
  Send yourself. **No WhatsApp API anywhere.**
- Products: add / edit / delete, multi-image upload to Supabase Storage,
  in-stock toggle, featured flags
- Export orders to CSV

## Security

Row Level Security (see `supabase/schema.sql`):
- Public (`anon` key) can only **INSERT** orders (status forced to `Pending`)
  and **SELECT** in-stock products. Customer data is never publicly readable.
- Only the authenticated admin (the single account you create in Supabase Auth)
  can read/update orders and manage products or images.

## Quick start

```bash
cp .env.example .env   # fill in your Supabase URL + anon key
npm install
npm run dev
```

Full step-by-step: backend setup, admin user, Storage bucket, Vercel/Netlify
deploy → see **[SETUP.md](./SETUP.md)**.

## Project layout

```
supabase/schema.sql     # tables, ORD-1001 sequence, RLS + storage policies
src/lib/supabase.js     # Supabase client + store contact env vars
src/context/            # cart state (localStorage-persisted)
src/components/        # Navbar, Footer, ProductCard, AdminRoute (auth guard)
src/pages/             # Home, Shop, Product, Cart, Checkout, OrderSuccess,
                       # Contact, AdminLogin, AdminDashboard
src/utils/helpers.js   # PKR formatting, phone validation, wa.me builder, CSV
```

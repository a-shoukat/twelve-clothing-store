# Twelve Clothing — Setup & Deploy Guide

A complete walkthrough: Supabase backend → env vars → local run → deploy on
Vercel (or Netlify). No accounts are created for you here — follow each step
in your own browser.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account).
2. **New project** → name it `twelve-clothing`, pick a region close to Pakistan
   (e.g. Singapore / Mumbai), set a strong database password, **Create**.
3. Wait ~2 minutes for the project to finish provisioning.

## 2. Run the database schema

1. In the Supabase dashboard, open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy the whole file, paste it
   into the editor, and press **Run**.
3. You should see "Success. No rows returned". This creates:
   - `products` and `orders` tables
   - the `ORD-1001` order-ID sequence + trigger
   - Row Level Security: public can only **INSERT** orders and **SELECT**
     in-stock products; only a logged-in admin can read/update orders or
     manage products
   - Storage policies for the `product-images` bucket

## 3. Create the product-images Storage bucket

1. Go to **Storage** → **New bucket**.
2. Name: `product-images`, toggle **Public bucket** to **ON**, then **Create**.
   (The SQL file already created the matching Storage policies.)

## 4. Create the admin user (you)

1. Go to **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your email and a strong password. Leave "Auto Confirm User" **ON**,
   then **Create**.
3. **Important:** this is the ONLY login — keep these credentials private.
   Anyone signed in is treated as the admin, so do not create accounts for
   anyone else.

## 5. Get your API keys

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon `public` key**.
   (Never use the `service_role` key in this frontend app.)

## 6. Configure the app

1. In the project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_STORE_WHATSAPP=923001234567     # your WhatsApp, no "+" (03XXXXXXXXX -> 92XXXXXXXXXX)
   VITE_STORE_INSTAGRAM=https://www.instagram.com/yourbrand
   ```

## 7. Run locally

```bash
npm install
npm run dev
```

- Store: http://localhost:5173
- Admin login: http://localhost:5173/admin/login

## 8. First login & adding products

1. Open `/admin/login`, sign in with the admin email/password from step 4.
2. Go to the **Products** tab → **+ ADD PRODUCT**.
3. Fill in name, price (Rs.), category (Men/Women/Kids), sizes and colors as
   comma-separated values (e.g. `S, M, L`), description, fabric details.
4. **Upload images** (multiple allowed) — they go to the `product-images`
   bucket. Tick **In stock** so the product appears in the shop.
5. **Save product** — it is live on the store immediately.

## 9. Deploy on Vercel (recommended)

1. Push this folder to a GitHub repo (or use the Vercel CLI).
2. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project** →
   import your repo.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`
   (Vercel detects this automatically).
4. In **Environment Variables**, add the four `VITE_*` variables from step 6.
5. **Deploy** → you get a public URL like `twelve-clothing.vercel.app`.

## 10. Deploy on Netlify (alternative)

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** →
   **Import an existing project** → connect your repo.
2. Build command: `npm run build`, publish directory: `dist`.
3. **Site settings → Environment variables**: add the four `VITE_*` variables.
4. **Deploy** → public URL like `twelve-clothing.netlify.app`.

> After deploying, redeploy (or trigger a rebuild) whenever you change env
> vars — Vite bakes them in at build time.

---

## How orders work (day to day)

1. A customer places an order on the website → saved in Supabase with status
   **Pending** and an ID like `ORD-1001`.
2. You open `/admin` → **Orders** tab (newest first, pending orders badged).
3. Click an order → review details → change status via the dropdown.
4. Press **SEND WHATSAPP CONFIRMATION** → WhatsApp opens with the customer's
   number and a pre-filled confirmation message → **you press Send yourself**.
   No WhatsApp API is used anywhere.
5. **EXPORT CSV** downloads the (filtered) order list for your records.

## Troubleshooting

| Problem | Fix |
|---|---|
| Products don't show on the shop | In admin, make sure **In stock** is ticked. Public can only see in-stock products (RLS). |
| "Could not place order" at checkout | Make sure the full `schema.sql` ran — checkout uses the `place_order` RPC function, not a raw insert. |
| Images don't upload in admin | Bucket must be named exactly `product-images` and public; Storage policies must exist. |
| Admin login fails | The user must exist under **Authentication → Users** with a confirmed email. |
| Changes to `.env` not reflected | Restart `npm run dev`, or redeploy — Vite reads env at build/start time. |

-- ============================================================================
-- Twelve Clothing — Supabase schema
-- Run this in the Supabase SQL Editor (Database -> SQL Editor -> New query).
-- It creates tables, a readable order-ID sequence (ORD-1001, ORD-1002, ...),
-- Row Level Security policies, and product-image Storage policies.
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       numeric(12, 2) not null check (price >= 0),
  category    text not null check (category in ('Men', 'Women', 'Kids')),
  sizes       text[] not null default '{}',
  colors      text[] not null default '{}',
  description text not null default '',
  fabric      text not null default '',
  images      text[] not null default '{}',   -- public Supabase Storage URLs
  in_stock    boolean not null default true,  -- false = hidden from the shop
  featured    boolean not null default false, -- shown in "Featured" on Home
  is_new      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  order_id       text unique,                       -- filled by trigger: ORD-1001
  customer_name  text not null,
  phone          text not null,                     -- 03XXXXXXXXX (validated in app)
  city           text not null,
  address        text not null,
  notes          text not null default '',
  items          jsonb not null default '[]',       -- [{product_id,name,size,color,qty,price}]
  total          numeric(12, 2) not null check (total >= 0),
  payment_method text not null default 'Cash on Delivery',
  status         text not null default 'Pending'
                   check (status in ('Pending','Confirmed','Packed','Shipped','Delivered','Cancelled')),
  created_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- READABLE ORDER IDs: ORD-1001, ORD-1002, ...
-- ----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_sequences where schemaname = 'public' and sequencename = 'order_seq') then
    create sequence order_seq start 1001;
  end if;
end $$;

create or replace function set_readable_order_id()
returns trigger
language plpgsql
as $$
begin
  if new.order_id is null or new.order_id = '' then
    new.order_id := 'ORD-' || nextval('order_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_order_id on orders;
create trigger trg_set_order_id
  before insert on orders
  for each row
  execute function set_readable_order_id();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
--
-- Security model: there is exactly ONE admin account, created manually in
-- Supabase Auth (see SETUP.md). Any authenticated session therefore IS the
-- admin. The public (anon key) can:
--   - SELECT products that are in stock   (the shop)
--   - INSERT new orders (checkout)        (status forced to 'Pending')
-- The public can NEVER read orders or customer data.
-- ----------------------------------------------------------------------------

alter table products enable row level security;
alter table orders   enable row level security;

-- PRODUCTS ---------------------------------------------------------------
drop policy if exists "Public can view in-stock products" on products;
create policy "Public can view in-stock products"
  on products for select
  to anon, authenticated
  using (in_stock = true);

drop policy if exists "Admin can manage products" on products;
create policy "Admin can manage products"
  on products for all
  to authenticated
  using (true)
  with check (true);

-- ORDERS -----------------------------------------------------------------
-- Public may insert orders, but only with status 'Pending' (no privilege
-- escalation, no reading).
drop policy if exists "Public can place orders" on orders;
create policy "Public can place orders"
  on orders for insert
  to anon, authenticated
  with check (status = 'Pending');

-- Admin (any authenticated user = the owner) can read and update orders.
drop policy if exists "Admin can view orders" on orders;
create policy "Admin can view orders"
  on orders for select
  to authenticated
  using (true);

drop policy if exists "Admin can update orders" on orders;
create policy "Admin can update orders"
  on orders for update
  to authenticated
  using (true)
  with check (true);

-- Helpful indexes
create index if not exists idx_orders_created_at on orders (created_at desc);
create index if not exists idx_orders_status     on orders (status);
create index if not exists idx_orders_order_id   on orders (order_id);
create index if not exists idx_products_category on products (category);

-- ----------------------------------------------------------------------------
-- SECURE CHECKOUT RPC
--
-- The storefront places orders through this function (not a raw INSERT), so
-- the public never needs SELECT rights on the orders table: the function
-- inserts with status forced to 'Pending' and returns only the new order_id.
-- The frontend calls: supabase.rpc('place_order', { p_customer_name, ... })
-- ----------------------------------------------------------------------------

create or replace function place_order(
  p_customer_name  text,
  p_phone          text,
  p_city           text,
  p_address        text,
  p_notes          text,
  p_items          jsonb,
  p_total          numeric,
  p_payment_method text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id text;
begin
  if p_customer_name is null or length(trim(p_customer_name)) < 3 then
    raise exception 'Invalid customer name';
  end if;
  if p_phone is null or trim(p_phone) !~ '^03[0-9]{9}$' then
    raise exception 'Invalid phone number';
  end if;
  if p_city is null or length(trim(p_city)) < 2 then
    raise exception 'Invalid city';
  end if;
  if p_address is null or length(trim(p_address)) < 10 then
    raise exception 'Invalid address';
  end if;
  if p_total is null or p_total < 0 then
    raise exception 'Invalid total';
  end if;

  insert into orders (customer_name, phone, city, address, notes, items, total, payment_method, status)
  values (
    trim(p_customer_name),
    trim(p_phone),
    trim(p_city),
    trim(p_address),
    coalesce(trim(p_notes), ''),
    coalesce(p_items, '[]'::jsonb),
    p_total,
    coalesce(nullif(trim(p_payment_method), ''), 'Cash on Delivery'),
    'Pending'  -- always forced; callers cannot set any other status
  )
  returning order_id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function
  place_order(text, text, text, text, text, jsonb, numeric, text)
  from public;
grant execute on function
  place_order(text, text, text, text, text, jsonb, numeric, text)
  to anon, authenticated;

-- ----------------------------------------------------------------------------
-- STORAGE: product images bucket (public read, admin write)
-- Create the bucket in the Dashboard (Storage -> New bucket -> name
-- "product-images", Public = ON), or uncomment the insert below.
-- ----------------------------------------------------------------------------

-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true)
-- on conflict (id) do nothing;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admin can upload product images" on storage.objects;
create policy "Admin can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Admin can update product images" on storage.objects;
create policy "Admin can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "Admin can delete product images" on storage.objects;
create policy "Admin can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

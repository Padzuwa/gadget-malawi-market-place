-- ============================================================
-- Gadget Malawi — Orders + Order Items
-- Safe to re-run.
-- ============================================================

do $$ begin
  create type order_status as enum (
    'pending',      -- created, awaiting payment
    'paid',         -- payment received, funds in escrow
    'shipped',      -- seller has sent / ready for pickup
    'delivered',    -- buyer marked received
    'released',     -- funds released to seller
    'cancelled',    -- cancelled before payment
    'refunded'      -- refunded to buyer
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_method as enum ('pickup', 'delivery');
exception when duplicate_object then null; end $$;

-- ---------- Orders ----------
-- One order per (buyer, seller). A cart with items from 3 sellers
-- creates 3 orders in a single checkout, sharing a common checkout_id.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  checkout_id uuid not null,  -- groups orders created together

  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,

  status order_status not null default 'pending',

  subtotal numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(12, 2) not null check (total >= 0),
  currency text not null default 'MWK',

  delivery_method delivery_method not null,
  delivery_address text,
  buyer_phone text not null,
  buyer_note text,

  -- Payment fields (populated later when PayChangu is wired)
  paychangu_ref text unique,
  paychangu_charge_id text,

  -- Lifecycle timestamps
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  released_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_idx
  on public.orders (buyer_id, created_at desc);
create index if not exists orders_seller_idx
  on public.orders (seller_id, created_at desc);
create index if not exists orders_status_idx
  on public.orders (status);
create index if not exists orders_checkout_idx
  on public.orders (checkout_id);

-- ---------- Order items ----------
-- Snapshot fields preserve what was actually ordered even if the
-- product listing is later edited or deleted.

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,

  title text not null,
  subtitle text,
  image_url text,
  condition text,
  price numeric(12, 2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0),

  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx
  on public.order_items (order_id);

-- ---------- updated_at trigger ----------
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Orders: buyers see their own, sellers see incoming
drop policy if exists "buyers view own orders" on public.orders;
create policy "buyers view own orders"
  on public.orders for select
  using (buyer_id = auth.uid());

drop policy if exists "sellers view incoming orders" on public.orders;
create policy "sellers view incoming orders"
  on public.orders for select
  using (seller_id = auth.uid());

-- Only the buyer can create an order, and only for themselves
drop policy if exists "buyers create orders" on public.orders;
create policy "buyers create orders"
  on public.orders for insert
  with check (buyer_id = auth.uid());

-- Buyers can update (server action enforces which statuses are legal)
drop policy if exists "buyers update own orders" on public.orders;
create policy "buyers update own orders"
  on public.orders for update
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

-- Sellers can update their own orders (server action enforces the state machine)
drop policy if exists "sellers update own orders" on public.orders;
create policy "sellers update own orders"
  on public.orders for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

-- Order items inherit visibility from the parent order
drop policy if exists "users view order items" on public.order_items;
create policy "users view order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

drop policy if exists "buyers insert order items" on public.order_items;
create policy "buyers insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.buyer_id = auth.uid()
    )
  );

-- ---------- Anti-over-sell: prevent double-selling a one-of-a-kind item ----------
-- Products are one-of-a-kind by default. If an order exists for a product
-- that isn't cancelled or refunded, the listing should be marked sold.
-- We enforce this in application code (server action), not the DB,
-- for clarity. See src/app/checkout/actions.ts.
-- ============================================================
-- Gadget Malawi — Favorites (saved items)
-- Safe to re-run.
-- ============================================================

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_user_idx
  on public.favorites (user_id, created_at desc);

create index if not exists favorites_product_idx
  on public.favorites (product_id);

alter table public.favorites enable row level security;

-- Users can read their own favorites only
drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

-- Users can insert their own favorites
drop policy if exists "Users insert own favorites" on public.favorites;
create policy "Users insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

-- Users can delete their own favorites
drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
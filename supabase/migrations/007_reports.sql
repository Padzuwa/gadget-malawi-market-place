-- ============================================================
-- Gadget Malawi — Reports (listing abuse + safety)
-- Safe to re-run.
-- ============================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reason text not null check (
    reason in (
      'scam',
      'stolen',
      'counterfeit',
      'wrong-category',
      'offensive',
      'spam',
      'prohibited',
      'other'
    )
  ),
  details text check (details is null or length(details) <= 1000),
  status text not null default 'pending' check (
    status in ('pending', 'reviewed', 'resolved', 'dismissed')
  ),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx
  on public.reports (status, created_at desc);

create index if not exists reports_product_idx
  on public.reports (product_id);

create index if not exists reports_reporter_idx
  on public.reports (reporter_id, created_at desc);

alter table public.reports enable row level security;

-- Users can create reports (signed in or anonymous — reporter_id is nullable)
drop policy if exists "Anyone can create a report" on public.reports;
create policy "Anyone can create a report"
  on public.reports for insert
  with check (true);

-- Users can view their own reports
drop policy if exists "Users view own reports" on public.reports;
create policy "Users view own reports"
  on public.reports for select
  using (reporter_id = auth.uid());

-- Admins can view and update all reports
drop policy if exists "Admins view all reports" on public.reports;
create policy "Admins view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

drop policy if exists "Admins update reports" on public.reports;
create policy "Admins update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
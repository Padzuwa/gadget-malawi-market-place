-- ============================================================
-- Gadget Malawi — Profile extensions
-- Adds columns needed for the profile system.
-- Safe to re-run.
-- ============================================================

alter table public.profiles
  add column if not exists business_hours text
    check (business_hours is null or length(business_hours) <= 200),
  add column if not exists verification_submitted_at timestamptz,
  add column if not exists username_changed_at timestamptz,
  add column if not exists deleted_at timestamptz;

-- Case-insensitive unique usernames.
-- Existing unique constraint on `username` is case-sensitive; this
-- prevents "John" and "john" from coexisting.
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null and deleted_at is null;

-- Index for public profile lookups by username
create index if not exists profiles_username_idx
  on public.profiles (username)
  where deleted_at is null;

-- Prevent deleted users from appearing in public queries.
-- Add a small RLS policy addendum: deleted profiles are not publicly readable.
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (deleted_at is null or auth.uid() = id);

-- Confirm
select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;
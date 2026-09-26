-- ============================================================
-- Gadget Malawi — Chat (conversations + messages)
-- Safe to re-run.
-- ============================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_no_self check (buyer_id <> seller_id)
);

-- One conversation per (buyer, seller, product). NULL product is
-- treated as a single "general" thread between the two users.
create unique index if not exists conversations_unique_thread
  on public.conversations (
    buyer_id,
    seller_id,
    coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists conversations_buyer_idx
  on public.conversations (buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx
  on public.conversations (seller_id, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

create index if not exists messages_unread_idx
  on public.messages (conversation_id, read_at)
  where read_at is null;

-- ---------- Triggers ----------

-- Update conversation summary whenever a new message lands
create or replace function public.on_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
    set last_message_at = new.created_at,
        last_message_preview = left(new.body, 120),
        updated_at = now()
    where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_update_conversation on public.messages;
create trigger messages_update_conversation
  after insert on public.messages
  for each row execute function public.on_new_message();

-- ---------- RLS ----------

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations: only the two participants
drop policy if exists "Participants view own conversations" on public.conversations;
create policy "Participants view own conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Participants create own conversations" on public.conversations;
create policy "Participants create own conversations"
  on public.conversations for insert
  with check (
    auth.uid() in (buyer_id, seller_id)
    and buyer_id <> seller_id
  );

drop policy if exists "Participants update own conversations" on public.conversations;
create policy "Participants update own conversations"
  on public.conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Messages: only participants in the parent conversation
drop policy if exists "Participants view messages" on public.messages;
create policy "Participants view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants mark messages read" on public.messages;
create policy "Participants mark messages read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ---------- Realtime ----------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end $$;
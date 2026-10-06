-- Extend reports table to support conversation reports.
-- product_id was already nullable. Add conversation_id.

alter table public.reports
  add column if not exists conversation_id uuid
    references public.conversations(id) on delete set null;

create index if not exists reports_conversation_idx
  on public.reports (conversation_id);

-- Update the constraint: a report must have at least one target
-- (either a product or a conversation).
alter table public.reports
  drop constraint if exists reports_target_check;

alter table public.reports
  add constraint reports_target_check
  check (product_id is not null or conversation_id is not null);
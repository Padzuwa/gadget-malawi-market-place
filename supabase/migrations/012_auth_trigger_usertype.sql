-- ============================================================
-- Extend handle_new_user trigger to also read user_type from signup metadata
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_user_type user_type;
begin
  -- Read user_type from signup metadata, defaulting to 'individual'
  begin
    v_user_type :=
      coalesce(
        (new.raw_user_meta_data->>'user_type')::user_type,
        'individual'::user_type
      );
  exception when others then
    v_user_type := 'individual'::user_type;
  end;

  insert into public.profiles (id, display_name, user_type)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    v_user_type
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
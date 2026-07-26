-- Add increment_cheer_count RPC function
-- This function atomically increments the cheer_count for a user
-- Called from lib/supabase/cheers.ts when a cheer is created

create or replace function public.increment_cheer_count(target_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.users
  set cheer_count = cheer_count + 1
  where slug = target_slug
    and is_deleted = false
  returning cheer_count into new_count;
  
  return new_count;
end;
$$;

-- Revoke execute from anon/authenticated (server-side only)
revoke execute on function public.increment_cheer_count(text) from anon, authenticated;
grant execute on function public.increment_cheer_count(text) to service_role;

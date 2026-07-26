-- Add add_points RPC function
-- This function atomically adds points to a user's account
-- Called from lib/supabase/data/users.server.ts

create or replace function public.add_points(target_slug text, amount integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set points = points + amount
  where slug = target_slug
    and is_deleted = false;
  
  return true;
end;
$$;

-- Revoke execute from anon/authenticated (server-side only)
revoke execute on function public.add_points(text, integer) from anon, authenticated;
grant execute on function public.add_points(text, integer) to service_role;

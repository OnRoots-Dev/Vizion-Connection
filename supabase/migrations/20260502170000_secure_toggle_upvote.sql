-- Restrict execution of SECURITY DEFINER function from public roles

revoke execute on function public.toggle_upvote(uuid, bigint) from public;
revoke execute on function public.toggle_upvote(uuid, bigint) from anon;
revoke execute on function public.toggle_upvote(uuid, bigint) from authenticated;

-- Ensure server-side service role can still call it
grant execute on function public.toggle_upvote(uuid, bigint) to service_role;

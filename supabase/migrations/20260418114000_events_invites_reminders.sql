-- events / event_invites / event_reminders
-- NOTE: This migration is additive and uses IF NOT EXISTS / conditional constraints to avoid conflicts.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean default false,
  location text,
  owner_id uuid references auth.users(id) on delete cascade not null,
  community_id uuid,
  event_type text check (event_type in ('personal','shared','event','booking')) not null default 'personal',
  is_public boolean default false,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add FK to communities only if the table exists (prevents migration failure in environments without it)
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'communities'
  ) then
    alter table public.events
      add constraint events_community_id_fkey
      foreign key (community_id)
      references public.communities(id)
      on delete cascade;
  end if;
exception
  when duplicate_object then
    null;
end;
$$;

create index if not exists idx_events_owner_start
  on public.events (owner_id, start_at asc);

create index if not exists idx_events_public_start
  on public.events (is_public, start_at asc);

create or replace function public.touch_events_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row execute function public.touch_events_updated_at();


create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  invitee_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('pending','accepted','declined')) default 'pending',
  created_at timestamptz default now(),
  unique(event_id, invitee_id)
);

create index if not exists idx_event_invites_invitee
  on public.event_invites (invitee_id, created_at desc);

create index if not exists idx_event_invites_event
  on public.event_invites (event_id);


create table if not exists public.event_reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  remind_minutes_before int not null default 60,
  sent boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_event_reminders_due
  on public.event_reminders (sent, user_id, created_at desc);


-- RLS
alter table public.events enable row level security;
alter table public.event_invites enable row level security;
alter table public.event_reminders enable row level security;

-- events
-- select: owner OR invited OR public
create policy "events_select_owner_or_invited_or_public"
  on public.events
  for select
  using (
    owner_id = auth.uid()
    or is_public = true
    or exists (
      select 1
      from public.event_invites ei
      where ei.event_id = events.id
        and ei.invitee_id = auth.uid()
    )
  );

-- insert: owner only
create policy "events_insert_owner"
  on public.events
  for insert
  with check (
    owner_id = auth.uid()
  );

-- update/delete: owner only (safer default)
create policy "events_update_owner"
  on public.events
  for update
  using (
    owner_id = auth.uid()
  )
  with check (
    owner_id = auth.uid()
  );

create policy "events_delete_owner"
  on public.events
  for delete
  using (
    owner_id = auth.uid()
  );


-- event_invites
-- select: invitee or event owner
create policy "event_invites_select_invitee_or_owner"
  on public.event_invites
  for select
  using (
    invitee_id = auth.uid()
    or exists (
      select 1
      from public.events e
      where e.id = event_invites.event_id
        and e.owner_id = auth.uid()
    )
  );

-- insert: event owner only
create policy "event_invites_insert_owner"
  on public.event_invites
  for insert
  with check (
    exists (
      select 1
      from public.events e
      where e.id = event_invites.event_id
        and e.owner_id = auth.uid()
    )
  );

-- update: invitee can update status, owner can update anything
create policy "event_invites_update_invitee_or_owner"
  on public.event_invites
  for update
  using (
    invitee_id = auth.uid()
    or exists (
      select 1
      from public.events e
      where e.id = event_invites.event_id
        and e.owner_id = auth.uid()
    )
  )
  with check (
    invitee_id = auth.uid()
    or exists (
      select 1
      from public.events e
      where e.id = event_invites.event_id
        and e.owner_id = auth.uid()
    )
  );

-- delete: event owner only
create policy "event_invites_delete_owner"
  on public.event_invites
  for delete
  using (
    exists (
      select 1
      from public.events e
      where e.id = event_invites.event_id
        and e.owner_id = auth.uid()
    )
  );


-- event_reminders
create policy "event_reminders_select_own"
  on public.event_reminders
  for select
  using (
    user_id = auth.uid()
  );

create policy "event_reminders_insert_own"
  on public.event_reminders
  for insert
  with check (
    user_id = auth.uid()
  );

create policy "event_reminders_update_own"
  on public.event_reminders
  for update
  using (
    user_id = auth.uid()
  )
  with check (
    user_id = auth.uid()
  );

create policy "event_reminders_delete_own"
  on public.event_reminders
  for delete
  using (
    user_id = auth.uid()
  );

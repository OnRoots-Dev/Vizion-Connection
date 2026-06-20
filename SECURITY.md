# Security

## RLS (Row Level Security) Policy — Permanent Rule

`anon` / `authenticated` roles have **SELECT-only** access on `users`, `journeys`, `career_profiles`, and `ads`. **All writes go through service-role server routes** (Next.js API routes using `lib/supabase/server.ts` → `supabaseServer`). The service role bypasses GRANTs and RLS.

**Do not:**
- Reintroduce client-side direct writes (`supabaseBrowser` INSERT/UPDATE/DELETE) to the tables above.
- Create wide-open policies (`USING (true)` / `WITH CHECK (true)`) for the `public` / `anon` / `authenticated` roles on write commands.
- Use broken ownership checks like `auth.uid()::text = slug`. Correct ownership predicates are `auth.uid() = users.auth_id` or `auth.email() = users.email`.

If a client-side write is genuinely required, add a strict column-scoped RLS policy and/or a `SECURITY DEFINER` RPC — never a blanket policy.

---

## RLS Security Audit — 2026-06-20

Project: `qyeapzdwdkqmcsylkdfi` (Vizion Connection, production).
Method: static audit (Supabase advisor + `pg_policies` + column GRANTs) followed by live CRUD testing with throwaway test users via the anon client (RLS enforced). All test data deleted after each run.

### Migrations applied

| ID | Scope | Verification |
|----|-------|--------------|
| `rls_a_users_lockdown` | `users`: REVOKE INSERT/UPDATE/DELETE from anon/authenticated; drop column-unrestricted self-update policy | 5/5 PASS |
| `rls_b_journeys_schedules` | `journeys`: REVOKE writes + drop `journeys_update_cheer`; `schedules`: fix `schedules_select_own` to owner-only | 6/6 PASS |
| `rls_c_career_ads` | `career_profiles`: restrict SELECT to public-user-or-owner, REVOKE writes + drop broken policy; `ads`: REVOKE writes + drop broken policies | 7/7 PASS |

### Vulnerabilities — before / after

| # | Vulnerability | Severity | Before (reproduced) | After (verified) |
|---|---------------|----------|---------------------|------------------|
| 1 | `users` privilege escalation (self-update `role=Admin`, `points`, etc.) | Critical | anon UPDATE succeeded, `role=Admin` persisted | Blocked `42501`, `role` unchanged |
| 2 | `journeys` arbitrary row/column tampering (others' `content`, `cheer_count`) | High | anon UPDATE persisted `content="HACKED"`, `cheer=12345` | Blocked `42501`, unchanged |
| 3 | `schedules` private-row read leak | Medium | others' `is_public=false` rows readable | 0 rows (owner-only) |
| 4 | `career_profiles` all-rows public read (incl. private users) | Medium | every profile readable | public-user-or-owner only |
| 5 | `ads` / `career_profiles` broken write policies (`auth.uid()::text = slug`) | Low | dead/over-strict policies | dropped + writes revoked |

### Non-regression (verified still working)
- New user registration (service-role `users` INSERT)
- Logged-in user reads own `users` row
- Public users / public journeys readable (Timeline / Pulse / Dashboard)
- Owner reads own schedules (public + private)
- Public + own `career_profiles` readable; active+approved `ads` readable
- Server-side writes: journey/career_profiles updates, `increment_cheer_count` & `add_points` RPCs, `ads` insert

### Advisor status after fixes
- `rls_policy_always_true` (journeys permissive UPDATE): **resolved**
- `rls_enabled_no_policy` (16 tables): INFO — intentionally deny-all (service-role-only access), not a leak
- `auth_leaked_password_protection`: enable via Dashboard → Authentication (separate, non-RLS auth setting)

---

## Rollback SQL

### (a) `rls_a_users_lockdown`
```sql
grant insert, update, delete on table public.users to anon, authenticated;
create policy "本人のみ自分のレコードを更新" on public.users
  for update to public using (auth.uid() = auth_id);
```

### (b) `rls_b_journeys_schedules`
```sql
grant insert, update, delete on table public.journeys to anon, authenticated;
create policy "journeys_update_cheer" on public.journeys
  for update to public using (true) with check (true);
alter policy "schedules_select_own" on public.schedules using (true);
```

### (c) `rls_c_career_ads`
```sql
-- career_profiles
alter policy "career_profiles_select_public" on public.career_profiles using (true);
create policy "career_profiles_update_own" on public.career_profiles
  for all to public using ((auth.uid())::text = user_slug);
grant insert, update, delete on table public.career_profiles to anon, authenticated;
-- ads
create policy "ads_insert" on public.ads for insert to authenticated
  with check (exists (select 1 from users u where u.slug = (auth.uid())::text and u.role = 'Admin' and u.is_deleted = false));
create policy "ads_update" on public.ads for update to authenticated
  using (exists (select 1 from users u where u.slug = (auth.uid())::text and u.role = 'Admin' and u.is_deleted = false));
create policy "ads_delete" on public.ads for delete to authenticated
  using (exists (select 1 from users u where u.slug = (auth.uid())::text and u.role = 'Admin' and u.is_deleted = false));
grant insert, update, delete on table public.ads to anon, authenticated;
```

> Note: the rollback for (c) restores the *original broken* policies as-is for fidelity; do not "fix" them into working client-write policies without column-level controls (see the permanent rule above).

# Next.js Airtable → Supabase Migration – Analysis Report

Analysis focused on: login, register, verify, cheer logic, profile editing, password reset, and overall codebase health.

---

## 1. Remaining Airtable References

| Location | Finding |
|----------|---------|
| **`package.json`** | Dependencies `airtable` and `@types/airtable` are still present. No source code imports them. |
| **`package-lock.json`** | Same Airtable entries; remove after cleaning `package.json`. |
| **`lib/supabase/users.ts`** | Comments on lines 2 and 228: "Airtable版と同じ関数名・戻り値型を維持". Purely documentary; safe to remove or reword. |
| **Environment** | No `AIRTABLE_*` variables; only Supabase/Resend/Session/App. |

**Action:** Remove `airtable` and `@types/airtable` from `package.json` (and run `npm install` to refresh lockfile). Optionally remove or update Airtable comments in `lib/supabase/users.ts`.

---

## 2. Critical Bugs

### 2.1 Profile / share / account delete use `user.id` instead of `slug`

Supabase helpers key updates by **`slug`**, but several routes pass **`user.id`** (numeric, stringified).

- **`app/api/profile/save/route.ts`** (line 19):  
  `updateUserProfile(String(user.id), { ... })`  
  → `updateUserProfile(slug, fields)` uses `.eq("slug", slug)`. No row has `slug === "<user.id>"`, so **profile edits never persist**.

- **`app/api/share/complete/route.ts`** (line 20):  
  `updateUserProfile(String(user.id), { hasShared: true })`  
  → **`has_shared` is never updated**; share completion has no effect.

- **`app/api/account/delete/route.ts`** (line 19):  
  `deactivateUser(String(user.id))`  
  → `deactivateUser(slug)` uses `.eq("slug", slug)`. **Account “delete” does not deactivate the correct user** (no row matches).

**Fix:** Use `user.slug` (or `session.slug` where the user is already resolved) in all three routes:

- `updateUserProfile(user.slug, ...)` in profile/save and share/complete.
- `deactivateUser(user.slug)` in account/delete.

---

### 2.2 Email verification never sets `verified`

- **`features/auth/server/verify.ts`** (line 72):  
  `await markUserVerified(user.email);`

- **`lib/supabase/users.ts`** (line 214–217):  
  `markUserVerified(slug: string)` does `.eq("slug", slug)`.

Passing **email** where **slug** is expected means no row is updated. **Users remain `verified: false`** after clicking the verify link.

**Fix:** Call `markUserVerified(user.slug)` in `verify.ts`.

---

### 2.3 Verify token: wrong type and broken expiration / mark-used

- **`lib/supabase/verify-tokens.ts`**:  
  `findVerifyToken` is aliased to `useVerifyToken`, which:
  - Returns only `{ email, slug }` (no `id`, `used`, `createdAt`).
  - Marks the token as used when it is first read (update by `token`).

- **`features/auth/server/verify.ts`**:
  - Casts the result to `{ id, email, slug, used, createdAt }` and uses `tokenRecord.createdAt` for a 24h expiration check → **`createdAt` is undefined**, so the check is wrong.
  - Calls `markTokenUsed(tokenRecord.id)` → **`id` is undefined**; `markTokenUsed(token: string)` expects the token string, so the token is not marked by this call (only by `useVerifyToken`’s internal update).

**Fix (recommended):**

1. Add a **read-only** `findVerifyToken(token)` that:
   - Selects `id, email, slug, used, created_at` (and optionally `token` if you want to pass it to `markTokenUsed`).
   - Does **not** update `used`.
2. In the verify flow:
   - Use this read-only function for validation and expiration.
   - Call `markTokenUsed(token)` (with the token string) or a new `markTokenUsedById(id)` after a successful verify.
3. Align **`VerifyTokenRecord`** in `features/auth/types.ts` with the actual DB columns and the return type of the new `findVerifyToken`.

---

### 2.4 Cheer duplicate check: arguments reversed

- **`lib/supabase/cheers.ts`** (line 23):  
  `hasAlreadyCheered(toSlug: string, fromSlug: string)` — “has `fromSlug` already cheered `toSlug`?”

- **`app/api/cheer/route.ts`** (line 39):  
  `hasAlreadyCheered(session.slug, toSlug)` — i.e. `(fromSlug, toSlug)`.

So the route asks “has **toSlug** already cheered **session.slug**?” instead of “has **session.slug** already cheered **toSlug**?”. **Duplicate cheers from the same user to the same profile within 24h are possible.**

**Fix:** Call `hasAlreadyCheered(toSlug, session.slug)` in the cheer route.

---

### 2.5 Mission bonus can be claimed repeatedly

- **`app/api/missions/route.ts`** (line 26):  
  `updateUserPoints(user.slug, user.points + MISSION_BONUS_POINTS, { missionBonusGiven: true })`

- **`lib/supabase/users.ts`** (lines 226–233):  
  `updateUserPoints(slug, points, p0?)` only updates `points`; it **does not** update `mission_bonus_given`. The third argument is ignored.

So **`missionBonusGiven` is never set**, and the “二重付与防止” check in the route (`user.missionBonusGiven`) stays false. **Mission bonus can be claimed multiple times.**

**Fix:** After `updateUserPoints(...)`, call `setMissionBonusGiven(user.slug)` (already exported in `users.ts`). Alternatively, extend `updateUserPoints` to update `mission_bonus_given` when the option is passed.

---

## 3. TypeScript / Type Inconsistencies

- **Verify token:** `VerifyTokenRecord` in `features/auth/types.ts` includes `id`, `token`, `used`, `createdAt`, but `findVerifyToken` (currently `useVerifyToken`) returns only `{ email, slug }`. Verify flow relies on undefined `id` and `createdAt`. After fixing the verify flow (read-only find + proper mark-used), align the type with the real return shape and DB.

- **`updateUserProfile`:** Signature is `(slug: string, fields)`. Callers that pass `String(user.id)` are wrong at runtime; TypeScript does not prevent this because both are `string`. Fix call sites to pass `user.slug`; consider a branded type or a single “user identifier” type to avoid id/slug confusion.

- **`UserRecord` vs `ProfileRecord`:** `features/auth/types.ts` defines `UserRecord` (camelCase, app-facing); `lib/supabase/users.ts` uses `UserRow` (snake_case) and `toProfile()` → `ProfileRecord`. Overlap and slight divergence (e.g. `cardBgUrl`, `password`) can cause confusion. Consider unifying or clearly documenting which type is used where.

- **Public profile:** `PublicProfileData` (e.g. in `features/profile/types.ts`) may use `cardBgUrl`; `get-profile-by-slug` returns `profileImageUrl` and `avatarUrl`. Minor shape mismatch to align if `cardBgUrl` is part of the public contract.

---

## 4. Performance

- **Duplicate cheer count:** `getPublicProfileBySlug` (in `features/profile/server/get-profile-by-slug.ts`) calls `findUserBySlug(slug)` (which returns `user.cheerCount` from `users.cheer_count`) and then `countCheers(slug)` again. If `increment_cheer_count` RPC keeps `users.cheer_count` in sync, use a single source (e.g. `user.cheerCount`) and remove the extra `countCheers` call to avoid a second query.

- **Cheer route:** Validate `toSlug` (presence and type) once at the top of the handler, then do self-cheer and `hasAlreadyCheered` checks. Current order (self-cheer and duplicate check before validating `toSlug`) is correct for early exits but can be reordered for clarity and one validation point.

---

## 5. Supabase Usage

- **Single server client:** `lib/supabase/client.ts` uses `createClient(url, SUPABASE_SERVICE_ROLE_KEY)` everywhere. Service role bypasses RLS; all auth is enforced in API handlers (session cookie). No Supabase Auth in use.

- **No RLS in code:** No references to RLS or policies; security relies entirely on route-level checks. Acceptable for current design; if you later add RLS, consider a separate authenticated client for user-scoped operations and reserve service role for admin/background.

- **No raw SQL:** All access via `supabase.from(...)` and `supabase.rpc(...)` (e.g. `increment_cheer_count`, `add_points`). Ensure these RPCs exist and match in Supabase.

- **Client vs server:** Supabase is used only on the server; no browser client. Fits cookie-based session design.

---

## 6. API Inefficiencies and Consistency

- **Session access:** Some routes use `getSessionCookie()` (e.g. share/complete, missions), others `cookies().get(SESSION_COOKIE_NAME)?.value` (e.g. profile/save, account/*, cheer). Both work; standardizing on one helper would simplify maintenance.

- **Profile save:** No Zod (or other) validation on `POST /api/profile/save`; body is spread into `updateUserProfile`. Unknown keys are only filtered by `CAMEL_TO_SNAKE`; unmapped keys are sent to Supabase and can cause errors or unexpected updates. Add a schema and allow-list of fields.

- **Error handling:** Try/catch with `NextResponse.json({ error })` and 500; `console.error` for logging. Consider consistent error shapes and logging (e.g. request id, no sensitive data in responses).

---

## 7. Security

- **Secrets:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET` are server-only (e.g. via `lib/env.ts`), not in `NEXT_PUBLIC_*`. Good.

- **Reset-password request:** Returns `{ ok: true }` even when the user is not found, limiting email enumeration. Good.

- **Profile save:** Unvalidated body can send extra or dangerous fields. Mitigate with strict validation and allow-listing (see above).

- **Verify flow:** Because `markUserVerified(user.email)` is wrong, users stay unverified; combined with broken token expiration (undefined `createdAt`), verify UX and security are both affected. Fix as in §2.2 and §2.3.

- **Contact form:** No rate limiting in code; consider rate limiting to avoid abuse.

---

## 8. Unused Code

- **`app/api/account/delete/change-password/route.ts`:** Behaves like `account/change-password`; not referenced (e.g. Settings uses `/api/account/change-password`). Dead route; remove or document and wire if “delete account after password change” is intended.

- **`airtable` and `@types/airtable`:** Unused dependencies; remove from `package.json`.

---

## 9. Summary Checklist

| Category | Item | Severity |
|----------|------|----------|
| **Critical** | Profile save uses `user.id` → updates never persist | P0 |
| **Critical** | Share complete uses `user.id` → `has_shared` never set | P0 |
| **Critical** | Account delete uses `user.id` → wrong user / no deactivation | P0 |
| **Critical** | `markUserVerified(user.email)` → verified never set | P0 |
| **Critical** | Verify token: no id/createdAt, wrong markTokenUsed → expiration and reuse broken | P0 |
| **Critical** | `hasAlreadyCheered(session.slug, toSlug)` → arguments reversed, duplicate cheers | P0 |
| **Critical** | Mission bonus: `missionBonusGiven` never updated → repeat claims | P0 |
| **TS** | VerifyTokenRecord vs actual return type | P1 |
| **TS** | updateUserProfile callers pass id instead of slug (types don’t catch it) | P1 |
| **Perf** | getPublicProfileBySlug double count (findUserBySlug + countCheers) | P2 |
| **Arch** | Remove Airtable deps and comments | P2 |
| **Arch** | Profile save validation (Zod + allow-list) | P2 |
| **Arch** | Remove or repurpose `account/delete/change-password` route | P2 |
| **Arch** | Consider RLS + least-privilege client usage later | P3 |

---

## 10. Recommended Fix Order

1. **Id vs slug (profile, share, delete):** Change all `updateUserProfile(String(user.id), ...)` and `deactivateUser(String(user.id))` to use `user.slug`.
2. **Verify:** Call `markUserVerified(user.slug)` in verify.ts.
3. **Verify token:** Introduce read-only `findVerifyToken`, fix expiration and `markTokenUsed(token)` (or by id), align types.
4. **Cheer:** Use `hasAlreadyCheered(toSlug, session.slug)` in the cheer route.
5. **Missions:** Call `setMissionBonusGiven(user.slug)` after `updateUserPoints` (or extend `updateUserPoints` to set the flag).
6. Remove Airtable from `package.json` and optionally clean Airtable comments in `lib/supabase/users.ts`.
7. Add profile-save validation and remove duplicate route / duplicate cheer count as needed.

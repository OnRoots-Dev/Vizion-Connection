# Architecture

`Frontend → API route → feature/service → Supabase`

Frontend owns rendering and local interaction; API routes authenticate/authorize/validate/throttle; feature server services own domain use cases; `lib/` owns shared cross-cutting helpers; Supabase owns persistence/RLS. Sensitive operations use the server Supabase client only.

Current code also has direct feature/lib server access and dashboard SPA views. New work must fit existing boundaries rather than add parallel clients or duplicate domain services. Planned map/provider adapters remain behind a server/domain boundary; clients do not receive privileged credentials.

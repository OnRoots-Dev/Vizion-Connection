// Server-only Supabase clients
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (typeof window !== "undefined") {
  throw new Error("Supabase service client must not run in the browser");
}

export const supabaseServer = createSupabaseClient(url, serviceKey, {
  auth: { persistSession: false },
});

export const createClient = async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: process.env.NODE_ENV === 'production' ? '.vizion-connection.jp' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (values) => {
          // Server Component から呼ばれた場合、cookie の書き込みは不可（middleware が
          // セッション更新を担うため無視してよい）。Route Handler / Server Action では成功する。
          try {
            values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* called from a Server Component — safe to ignore */
          }
        },
      },
    },
  );
};

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
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (values) =>
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
};

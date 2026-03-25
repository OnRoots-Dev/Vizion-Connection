// Server-only Supabase client (service role)
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (typeof window !== "undefined") {
  throw new Error("Supabase service client must not run in the browser");
}

export const supabaseServer = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

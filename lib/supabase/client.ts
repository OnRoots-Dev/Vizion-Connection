// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

export const supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: {
        fetch: (input, init) => {
            return fetch(input, {
                ...init,
                next: { revalidate: 60 },
            } as RequestInit & { next?: { revalidate?: number } });
        },
    },
});
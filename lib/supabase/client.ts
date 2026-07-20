import { createBrowserClient } from "@supabase/ssr";
import { getAuthCookieOptions } from "@/lib/supabase/cookie-options";

/**
 * ブラウザ用 SSR クライアント（Cookie セッション）。
 * Domain=.vizion-connection.jp により apex / app サブドメインで共有される。
 */
export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: getAuthCookieOptions(),
        },
    );

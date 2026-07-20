// lib/supabase/cookie-options.ts
// vizion-connection.jp と app.vizion-connection.jp でセッション Cookie を共有するための設定。
// createServerClient / createBrowserClient の cookieOptions に渡すこと。

import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * 本番: Domain=.vizion-connection.jp + SameSite=None + Secure
 * ローカル: domain 未指定（host-only）+ SameSite=Lax（localhost では Secure/None が使えない）
 */
export function getAuthCookieOptions(): CookieOptionsWithName {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    return {
      domain: ".vizion-connection.jp",
      path: "/",
      sameSite: "none",
      secure: true,
    };
  }

  return {
    path: "/",
    sameSite: "lax",
    secure: false,
  };
}

/** setAll 時に Supabase が渡す options と共通設定をマージ（domain 抜け防止） */
export function mergeAuthCookieOptions(
  options?: Record<string, unknown> | null,
): CookieOptionsWithName {
  return {
    ...getAuthCookieOptions(),
    ...(options ?? {}),
    // 共通設定を優先（呼び出し側が domain を上書きして host-only になるのを防ぐ）
    ...getAuthCookieOptions(),
  };
}

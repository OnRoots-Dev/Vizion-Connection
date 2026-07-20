import { createClient } from "@/lib/supabase/server";
import { completeEmailVerification } from "@/features/auth/server/complete-verification";
import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";

// メール認証成功時の後処理（users.verified更新・各種報酬）。
// ウェルカムメールは /thanks?type=verified 表示後に送る。
// リダイレクトを止めないよう失敗はログのみ。
async function runPostVerification(user: User | null | undefined) {
  const slug = user?.user_metadata?.slug as string | undefined;
  if (!slug) {
    console.error("[auth/confirm] post-verification skipped: missing user_metadata.slug");
    return;
  }
  try {
    await completeEmailVerification(slug);
  } catch (err) {
    console.error("[auth/confirm] completeEmailVerification failed:", err);
  }
}

function verifiedThanksUrl(request: NextRequest) {
  return new URL("/thanks?type=verified", request.url);
}

function failedLoginUrl(request: NextRequest) {
  return new URL("/login?error=confirmation_failed", request.url);
}

/** ログ用: トークン類は出さず、キーの有無だけ */
function summarizeParams(searchParams: URLSearchParams) {
  return {
    has_code: Boolean(searchParams.get("code")),
    has_token_hash: Boolean(searchParams.get("token_hash")),
    type: searchParams.get("type"),
    error: searchParams.get("error"),
    error_code: searchParams.get("error_code"),
    error_description: searchParams.get("error_description"),
    // next はパス程度なら可（PII になりにくい）
    has_next: Boolean(searchParams.get("next")),
  };
}

function isEmailOtpType(value: string): value is EmailOtpType {
  return (
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const token_hash = searchParams.get("token_hash");

  console.info("[auth/confirm] hit", summarizeParams(searchParams));

  // Supabase 側が error クエリで戻してきた場合
  if (searchParams.get("error") || searchParams.get("error_code")) {
    console.error("[auth/confirm] redirect error from Supabase", {
      error: searchParams.get("error"),
      error_code: searchParams.get("error_code"),
      error_description: searchParams.get("error_description"),
    });
    return NextResponse.redirect(failedLoginUrl(request));
  }

  // メールアドレス変更
  if (code && type === "email_change") {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/confirm] exchangeCodeForSession (email_change) failed", {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name,
      });
    } else if (data.user) {
      await supabase.from("users").update({ email: data.user.email }).eq("auth_id", data.user.id);
      return NextResponse.redirect(new URL("/thanks?type=email_changed", request.url));
    }
    return NextResponse.redirect(failedLoginUrl(request));
  }

  // PKCE: ?code=... （同一ブラウザで signUp した code_verifier がある場合のみ成功しがち）
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/confirm] exchangeCodeForSession failed", {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name,
      });
    } else {
      await runPostVerification(data.session?.user ?? data.user);
      return NextResponse.redirect(verifiedThanksUrl(request));
    }
    // code 失敗時は token_hash があれば続ける
  }

  // token_hash フロー（メールテンプレートから直接 /auth/confirm?token_hash=...&type=signup）
  if (token_hash && type) {
    const supabase = await createClient();

    const candidates: EmailOtpType[] = isEmailOtpType(type)
      ? type === "signup"
        ? ["signup", "email"] // signup テンプレの互換フォールバック
        : [type]
      : ["signup", "email"];

    let lastError: { message: string; code?: string; status?: number; name?: string } | null =
      null;

    for (const otpType of candidates) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: otpType,
      });

      if (error) {
        lastError = {
          message: error.message,
          code: error.code,
          status: error.status,
          name: error.name,
        };
        console.error("[auth/confirm] verifyOtp failed", {
          attempted_type: otpType,
          message: error.message,
          code: error.code,
          status: error.status,
          name: error.name,
        });
        continue;
      }

      console.info("[auth/confirm] verifyOtp ok", {
        type: otpType,
        has_session: Boolean(data.session),
        has_user: Boolean(data.user),
      });
      await runPostVerification(data.session?.user ?? data.user);
      return NextResponse.redirect(verifiedThanksUrl(request));
    }

    console.error("[auth/confirm] verifyOtp all attempts failed", {
      types: candidates,
      lastError,
    });
    return NextResponse.redirect(failedLoginUrl(request));
  }

  console.error("[auth/confirm] no usable params (code / token_hash)", summarizeParams(searchParams));
  return NextResponse.redirect(failedLoginUrl(request));
}

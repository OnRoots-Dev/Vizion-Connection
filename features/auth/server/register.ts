// features/auth/server/register.ts
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createUser, findUserByEmail, findUserBySlug, findUserByAmbassadorCode, countUsersByRole } from "@/lib/supabase/data/users.server";
import type { RegisterInput, RegisterResponse } from "@/features/auth/types";
import { rewardOnetimeMission } from "@/lib/onetime-missions";

const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
);

const FOUNDING_MEMBER_LIMIT = 100;

function buildEmailRedirectTo(redirectTo?: string): string {
    const emailRedirectToBase = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`;
    return redirectTo
        ? `${emailRedirectToBase}?next=${encodeURIComponent(redirectTo)}`
        : emailRedirectToBase;
}

export async function resendSignupVerificationEmail(params: {
    email: string;
    redirectTo?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
        type: "signup",
        email: params.email,
        options: {
            emailRedirectTo: buildEmailRedirectTo(params.redirectTo),
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
    const supabase = await createClient();
    const { email, password, role, displayName, slug, region, prefecture, referrerSlug, redirectTo } = input;
    const resolvedDisplayName = displayName?.trim() || "";
    const resolvedRegion = region.trim();
    const resolvedPrefecture = prefecture?.trim() || null;

    // email + slug の重複チェックを並列実行
    const [existingByEmail, existingBySlug] = await Promise.all([
        findUserByEmail(email),
        findUserBySlug(slug),
    ]);

    if (existingByEmail) {
        if (!existingByEmail.verified) {
            const resendResult = await resendSignupVerificationEmail({ email, redirectTo });
            return {
                success: false,
                code: "PENDING_VERIFICATION",
                email,
                resent: resendResult.success,
                error: "このメールアドレスは既に仮登録されています",
            };
        }

        return {
            success: false,
            code: "ALREADY_REGISTERED",
            email,
            error: "このメールアドレスは既に登録済みです",
        };
    }

    if (existingBySlug) {
        return { success: false, error: "このユーザー名はすでに使用されています" };
    }

    if (referrerSlug && referrerSlug === slug) {
        return { success: false, error: "自分自身を紹介者に指定することはできません" };
    }

    // 紹介者ルックアップ + ロール数カウントを並列実行
    const [referrerUser, roleCount] = await Promise.all([
        referrerSlug
            ? findUserBySlug(referrerSlug).then((r) => r ?? findUserByAmbassadorCode(referrerSlug))
            : Promise.resolve(null),
        countUsersByRole(role),
    ]);

    if (referrerSlug && !referrerUser) {
        return { success: false, error: "紹介コードが無効です" };
    }
    const resolvedReferrerSlug = referrerUser?.slug;
    const isFoundingMember = roleCount < FOUNDING_MEMBER_LIMIT;

    const emailRedirectTo = buildEmailRedirectTo(redirectTo);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo,
            data: {
                slug,
                role,
            },
        },
    });

    if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
            const existingUser = await findUserByEmail(email);
            if (existingUser && !existingUser.verified) {
                const resendResult = await resendSignupVerificationEmail({ email, redirectTo });
                return {
                    success: false,
                    code: "PENDING_VERIFICATION",
                    email,
                    resent: resendResult.success,
                    error: "このメールアドレスは既に仮登録されています",
                };
            }

            return {
                success: false,
                code: "ALREADY_REGISTERED",
                email,
                error: "このメールアドレスは既に登録済みです",
            };
        }
        return { success: false, error: error.message };
    }

    if (!data.user) {
        return { success: false, error: "登録に失敗しました" };
    }

    // Supabase Auth は既存メールへの signUp でエラーを返さず、
    // identities が空のダミーユーザーを返す（メール列挙対策）。
    // この場合、確認メールは送信されないため登録済みとして扱う。
    if (!data.user.identities || data.user.identities.length === 0) {
        const resendResult = await resendSignupVerificationEmail({ email, redirectTo });
        if (resendResult.success) {
            return {
                success: false,
                code: "PENDING_VERIFICATION",
                email,
                resent: true,
                error: "このメールアドレスは既に仮登録されています",
            };
        }
        return {
            success: false,
            code: "ALREADY_REGISTERED",
            email,
            error: "このメールアドレスは既に登録済みです",
        };
    }

    const authUserId = data.user.id;
    const user = await createUser({
        authId: authUserId,
        email,
        passwordHash: "supabase-auth",
        role,
        displayName: resolvedDisplayName,
        slug,
        region: resolvedRegion,
        prefecture: resolvedPrefecture,
        referrerSlug: resolvedReferrerSlug,
        isFoundingMember,
    });
    if (!user) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
        if (deleteError) {
            console.error("[register] orphan rollback failed", deleteError.message);
        }
        return { success: false, error: "ユーザー作成に失敗しました" };
    }

    void rewardOnetimeMission(user.slug, "register_complete");

    return { success: true, slug: user.slug };
}

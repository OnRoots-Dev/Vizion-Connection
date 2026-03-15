import { findUserBySlug } from "@/lib/supabase/users";
import { createCheer, hasAlreadyCheered } from "@/lib/supabase/cheers";

export async function cheerProfile(toSlug: string, fromSlug: string) {
    try {
        const target = await findUserBySlug(toSlug);
        if (!target) return { success: false, error: "ユーザーが見つかりません" };

        // 重複チェック
        const already = await hasAlreadyCheered(toSlug, fromSlug);
        if (already) return { success: false, error: "すでにCheerしています" };

        // Cheer作成（cheers.ts内でcheer_countもインクリメント）
        const ok = await createCheer(toSlug, fromSlug);
        if (!ok) return { success: false, error: "Cheerに失敗しました" };

        const updated = await findUserBySlug(toSlug);
        return { success: true, cheerCount: updated?.cheerCount ?? target.cheerCount + 1 };
    } catch (err) {
        console.error("[cheerProfile]", err);
        return { success: false, error: "サーバーエラーが発生しました" };
    }
}
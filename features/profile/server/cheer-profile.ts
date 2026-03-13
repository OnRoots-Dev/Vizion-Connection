import { findUserBySlug } from "@/lib/airtable/users";
import { airtableBase } from "@/lib/airtable/client";
import { createCheer } from "@/lib/airtable/cheers";

const TABLE = "Users";

export async function cheerProfile(toSlug: string, fromSlug: string) {
    const target = await findUserBySlug(toSlug);
    try {
        if (!target) return { success: false, error: "ユーザーが見つかりません" };

        const newCount = (target.cheerCount ?? 0) + 1;

        // Airtable の Users.cheerCount を更新
        await airtableBase(TABLE).update(target.id, { cheerCount: newCount });

        await createCheer(fromSlug, toSlug);

        return { success: true, cheerCount: newCount };
    } catch (err) {
        console.error("[cheerProfile]", err);
        return { success: false, error: "サーバーエラーが発生しました" };
    }
}

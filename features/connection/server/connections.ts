// features/connection/server/connections.ts
import { supabaseServer } from "@/lib/supabase/server";
import { notifyConnectionAccepted } from "@/lib/notifications/create-notification";
import type { ConnectionListItem, ConnectionRecord, ConnectionStatus } from "../types";

const SELECT_COLUMNS = "id,requester_id,addressee_id,status,created_at,updated_at";

export type RequestResult =
    | { ok: true }
    | { ok: false; reason: string };

export async function requestConnection(
    actorId: number,
    targetSlug: string,
): Promise<RequestResult> {
    const { data: target } = await supabaseServer
        .from("users")
        .select("id, is_deleted")
        .eq("slug", targetSlug)
        .eq("is_deleted", false)
        .maybeSingle<{ id: number; is_deleted: boolean }>();

    if (!target) return { ok: false, reason: "対象ユーザーが見つかりません" };
    if (target.id === actorId) return { ok: false, reason: "自分自身には申請できません" };

    // 双方向の既存行を確認（UNIQUE(requester, addressee) は片方向のみ担保）。
    const { data: existing } = await supabaseServer
        .from("connections")
        .select(SELECT_COLUMNS)
        .or(`and(requester_id.eq.${actorId},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${actorId})`)
        .maybeSingle<ConnectionRecord>();

    if (existing) {
        if (existing.status === "accepted") {
            return { ok: false, reason: "すでにConnectionが成立しています" };
        }
        if (existing.requester_id === actorId) {
            return { ok: false, reason: "すでに申請済みです" };
        }
        // 相手からの保留中申請がある場合はここで承認扱いにしない（明示的承認フローを守る）。
        return { ok: false, reason: "相手から申請が届いています。承認してください" };
    }

    const { error } = await supabaseServer
        .from("connections")
        .insert({ requester_id: actorId, addressee_id: target.id });

    if (error) {
        console.error("[requestConnection]", error);
        return { ok: false, reason: "申請に失敗しました" };
    }
    return { ok: true };
}

export async function acceptConnection(actorId: number, connectionId: string): Promise<RequestResult> {
    // addressee 本人かつ pending のみ更新。対象行の存在まで確認（IDOR防止）。
    const { data, error } = await supabaseServer
        .from("connections")
        .update({ status: "accepted" as ConnectionStatus })
        .eq("id", connectionId)
        .eq("addressee_id", actorId)
        .eq("status", "pending")
        .select("id, requester_id, addressee_id");

    if (error) {
        console.error("[acceptConnection]", error);
        return { ok: false, reason: "承認に失敗しました" };
    }
    if (!data || data.length === 0) {
        return { ok: false, reason: "承認できる申請が見つかりません" };
    }

    await notifyAcceptor(connectionId);

    return { ok: true };
}

async function notifyAcceptor(connectionId: string): Promise<void> {
    // requester（申請者A）へ「承認された」通知を発行（失敗しても承認自体は成功扱い）。
    const { data } = await supabaseServer
        .from("connections")
        .select(
            `requester:users!connections_requester_id_fkey(slug),
             addressee:users!connections_addressee_id_fkey(slug, display_name)`,
        )
        .eq("id", connectionId)
        .maybeSingle<{
            requester: { slug: string } | null;
            addressee: { slug: string; display_name: string | null } | null;
        }>();

    if (!data?.requester?.slug || !data?.addressee?.slug) {
        console.error("[acceptConnection] notify skipped: user rows missing", connectionId);
        return;
    }

    try {
        await notifyConnectionAccepted({
            requesterSlug: data.requester.slug,
            acceptorSlug: data.addressee.slug,
            acceptorName: data.addressee.display_name,
        });
    } catch (e) {
        console.error("[acceptConnection] notification failed", e);
    }
}

/** pending のまま取り消し / accepted の解除も含め、当事者なら削除できる。 */
export async function removeConnection(actorId: number, connectionId: string): Promise<RequestResult> {
    const { data, error } = await supabaseServer
        .from("connections")
        .delete()
        .eq("id", connectionId)
        .or(`requester_id.eq.${actorId},addressee_id.eq.${actorId}`)
        .select("id");

    if (error) {
        console.error("[removeConnection]", error);
        return { ok: false, reason: "解除に失敗しました" };
    }
    if (!data || data.length === 0) return { ok: false, reason: "対象が見つかりません" };
    return { ok: true };
}

export async function listMyConnections(actorId: number): Promise<ConnectionListItem[]> {
    const { data, error } = await supabaseServer
        .from("connections")
        .select(
            `${SELECT_COLUMNS},
             requester:users!connections_requester_id_fkey(id,slug,display_name,avatar_url,is_deleted),
             addressee:users!connections_addressee_id_fkey(id,slug,display_name,avatar_url,is_deleted)`,
        )
        .or(`requester_id.eq.${actorId},addressee_id.eq.${actorId}`)
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) {
        console.error("[listMyConnections]", error);
        return [];
    }

    type Row = ConnectionRecord & {
        requester: { id: number; slug: string; display_name: string | null; avatar_url: string | null; is_deleted: boolean } | null;
        addressee: { id: number; slug: string; display_name: string | null; avatar_url: string | null; is_deleted: boolean } | null;
    };

    return ((data ?? []) as unknown as Row[])
        .filter((row) => {
            const counterpart = row.requester_id === actorId ? row.addressee : row.requester;
            return counterpart && !counterpart.is_deleted;
        })
        .map((row) => {
            const outgoing = row.requester_id === actorId;
            const counterpart = outgoing ? row.addressee : row.requester;
            return {
                ...row,
                direction: outgoing ? ("outgoing" as const) : ("incoming" as const),
                counterpart: counterpart
                    ? {
                          id: counterpart.id,
                          slug: counterpart.slug,
                          display_name: counterpart.display_name,
                          avatar_url: counterpart.avatar_url,
                      }
                    : null,
            };
        });
}

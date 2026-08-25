// features/connection/types.ts + validation（小さいため1モジュール）。
import { z } from "zod";

export const CONNECTION_STATUSES = ["pending", "accepted"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export interface ConnectionRecord {
    id: string;
    requester_id: number;
    addressee_id: number;
    status: ConnectionStatus;
    created_at: string;
    updated_at: string;
}

export interface ConnectionListItem extends ConnectionRecord {
    /** 自分が申請した側か */
    direction: "outgoing" | "incoming";
    counterpart: {
        id: number;
        slug: string;
        display_name: string | null;
        avatar_url: string | null;
    } | null;
}

export const connectionRequestSchema = z
    .object({
        // 公開識別子 slug で対象を指定する（内部FKはサービス内で users.id に解決）。
        target_slug: z.string().trim().min(1, "対象を指定してください").max(30),
    })
    .strict();

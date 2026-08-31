// app/u/[slug]/ConnectionButtonClient.tsx
// 公開プロフィール内での Connection 入口。
// サーバー側で接続状態を持てないため、クライアントで /api/connections を取得して導出する。
// 再利用: ConnectionButton（既存）/ ConnectionListItem（既存型）。
"use client";

import { useEffect, useState, useCallback } from "react";
import { ConnectionButton, type ConnectionState } from "@/app/(app)/dashboard/components/core/ConnectionButton";
import { apiGet } from "@/lib/api/core-client";
import type { ConnectionListItem } from "@/features/connection/types";

export default function ConnectionButtonClient({
    ownerId,
    ownerSlug,
}: {
    ownerId: number | null;
    ownerSlug: string;
}) {
    const [state, setState] = useState<ConnectionState>("none");
    const [connectionId, setConnectionId] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const data = await apiGet<{ success: boolean; connections: ConnectionListItem[] }>("/api/connections");
            const row = (data.connections ?? []).find((c) => c.counterpart?.id === ownerId);
            if (!row) {
                setState("none");
                setConnectionId(null);
                return;
            }
            setConnectionId(row.id);
            if (row.status === "accepted") {
                setState("accepted");
                return;
            }
            setState(row.direction === "outgoing" ? "outgoing" : "incoming");
        } catch {
            setState("none");
            setConnectionId(null);
        }
    }, [ownerId]);

    useEffect(() => {
        void load();
    }, [load]);

    if (!ownerId) return null;

    return (
        <ConnectionButton
            targetSlug={ownerSlug}
            state={state}
            connectionId={connectionId}
            onChanged={load}
        />
    );
}

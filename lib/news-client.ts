"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function useNewsNotification() {
    const [hasNew, setHasNew] = useState(false);

    useEffect(() => {
        const channel = supabaseBrowser
            .channel("news_posts_insert")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "news_posts" },
                (payload) => {
                    const isPublished = Boolean((payload.new as { is_published?: boolean }).is_published);
                    if (isPublished) setHasNew(true);
                },
            )
            .subscribe();

        return () => {
            supabaseBrowser.removeChannel(channel);
        };
    }, []);

    return { hasNew, clearNew: () => setHasNew(false) };
}

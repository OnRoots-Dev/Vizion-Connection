"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function PublicProfileRealtime({ slug }: { slug: string }) {
  const router = useRouter();

  useEffect(() => {
    const channel = supabaseBrowser
      .channel(`public_profile_${slug}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users", filter: `slug=eq.${slug}` }, () => {
        router.refresh();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "card_collections", filter: `target_slug=eq.${slug}` }, () => {
        router.refresh();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "card_collections", filter: `target_slug=eq.${slug}` }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [router, slug]);

  return null;
}

// app/(app)/dashboard/dev/components/page.tsx
// 開発用 UI コンポーネントギャラリー（dev または Admin のみ）

import { redirect, notFound } from "next/navigation";
import { getSupabaseProfile } from "@/lib/auth/session";
import ComponentGalleryClient from "./ComponentGalleryClient";

export const dynamic = "force-dynamic";

export default async function DevComponentsPage() {
  const isDev = process.env.NODE_ENV === "development";
  const profile = await getSupabaseProfile();

  if (!profile) {
    redirect("/login?redirect=/dashboard/dev/components");
  }

  // 本番は Admin のみ。開発環境はログイン済みなら可。
  if (!isDev && profile.role !== "Admin") {
    notFound();
  }

  return (
    <ComponentGalleryClient
      viewerRole={profile.role}
      isDev={isDev}
    />
  );
}

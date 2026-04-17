import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import PrivateProfilePage from "@/components/ui/PrivateProfilePage";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

async function findPublicProfileUser(username: string) {
  const byUsername = await supabaseServer
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("is_deleted", false)
    .maybeSingle();

  if (!byUsername.error && byUsername.data) return byUsername.data;

  const bySlug = await supabaseServer
    .from("users")
    .select("*")
    .eq("slug", username)
    .eq("is_deleted", false)
    .maybeSingle();

  if (!bySlug.error && bySlug.data) return bySlug.data;

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const user = await findPublicProfileUser(username);
  if (!user) {
    return { title: "Vizion Connection", robots: { index: false, follow: false } };
  }

  const displayName = String(user.full_name ?? user.display_name ?? username);
  const bio = (user.bio as string | null) ?? null;
  const ogImage = `${env.NEXT_PUBLIC_BASE_URL}/api/og/${String(user.slug ?? username)}`;

  return {
    title: `${displayName} (@${username}) | Vizion Connection`,
    description: bio ?? `${displayName} のプロフィール`,
    openGraph: {
      title: `${displayName} | Vizion Connection`,
      description: bio ?? "",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;

  const user = await findPublicProfileUser(username);
  if (!user) notFound();

  const isPublic = (user.is_public as boolean | null | undefined) ?? true;
  if (!isPublic) {
    return <PrivateProfilePage displayName={String(user.full_name ?? user.display_name ?? username)} />;
  }

  const slug = String(user.slug ?? username);
  redirect(`/u/${slug}`);
}

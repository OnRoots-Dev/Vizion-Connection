// app/(app)/dashboard/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { findUserBySlug } from "@/lib/supabase/users";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) redirect("/login");

    const session = verifySession(token);
    if (!session) redirect("/login");

    const user = await findUserBySlug(session.slug);
    if (!user) redirect("/login");

    return <SettingsClient user={user} />;
}
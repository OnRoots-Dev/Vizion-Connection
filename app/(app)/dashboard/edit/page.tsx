// app/(app)/dashboard/edit/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/users";
import { EditProfileClient } from "./EditProfileClient";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";

export default async function EditProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) redirect("/login");

    const session = verifySession(token);
    if (!session) redirect("/login");

    const user = await findUserBySlug(session.slug);
    if (!user) redirect("/login");

    // ✅ String(user.id) 変換不要 — UserRecord.id が number に統一されたため
    return <EditProfileClient user={user} />;
}
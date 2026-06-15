import { getSupabaseUser } from "@/lib/auth/session";
import { AppShell } from "./AppShell";

// 認証エリア（dashboard / pulse / timeline / news-rooms …）共通レイアウト。
// role は JWT(user_metadata) から取得するため DB アクセスは発生しない。
// 未ログイン時は role=null となり、AppShell 側で BottomNav を出さない。
export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const user = await getSupabaseUser();
    const role = (user?.user_metadata?.role as string | undefined) ?? null;

    return <AppShell role={role}>{children}</AppShell>;
}

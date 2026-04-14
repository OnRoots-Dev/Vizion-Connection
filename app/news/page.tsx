import { getNewsPosts } from "@/lib/news";
import NewsHeaderClient from "./NewsHeaderClient";
import { getOptionalSessionUser } from "@/lib/auth/get-optional-session-user";
import { getAdsForUser } from "@/lib/ads";
import { getPublicUsers } from "@/lib/supabase/data/users.server";
import { NewsRoomsPageClient } from "./NewsRoomsPageClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
    const user = await getOptionalSessionUser();
    const [posts, ads, publicUsers] = await Promise.all([
        getNewsPosts(),
        getAdsForUser(user?.prefecture ?? "", user?.sport ?? undefined),
        getPublicUsers({ limit: 12 }),
    ]);

    const recommendedUsers = publicUsers
        .filter((item) => item.role === "Athlete" || item.role === "Trainer")
        .slice(0, 5)
        .map((item) => ({
            slug: item.slug,
            displayName: item.displayName,
            role: item.role,
            avatarUrl: item.avatarUrl ?? item.profileImageUrl ?? null,
            sport: item.sport ?? null,
            region: item.region ?? null,
        }));

    return (
        <main className="min-h-screen bg-[#eef2f7] px-4 py-8 text-slate-900 sm:px-6">
            <div className="mx-auto w-full max-w-[1440px]">
                <NewsHeaderClient />
                <NewsRoomsPageClient posts={posts} ads={ads} recommendedUsers={recommendedUsers} />
            </div>
        </main>
    );
}

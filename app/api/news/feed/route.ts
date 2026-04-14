import { getProfileFromSession } from "@/features/profile/server/get-profile";
import { getFeedByKeyword, getTopFeedSections } from "@/lib/news/server";

export const revalidate = 300;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get("keyword")?.trim() ?? "";

    if (keyword) {
        const articles = await getFeedByKeyword(keyword);
        return Response.json(articles);
    }

    const result = await getProfileFromSession();
    const profile = result.success ? result.data.profile : null;

    if (profile) {
        const data = await getTopFeedSections({
            role: profile.role ?? "",
            sport: profile.sport ?? null,
            sportsCategory: profile.sportsCategory ?? null,
        });
        return Response.json(data);
    }

    const data = await getTopFeedSections({ role: "" });
    return Response.json(data);
}

import { getOpenlabPosts, getUserUpvotes } from "@/lib/openlab";
import OpenlabClient from "./OpenlabClient";
import { getOptionalSessionUser } from "@/lib/auth/get-optional-session-user";
import { getAdsForUser } from "@/lib/ads";

export const dynamic = "force-dynamic";

export default async function OpenlabPage() {
    const sessionUser = await getOptionalSessionUser();
    const session = sessionUser ? { userId: String(sessionUser.id) } : null;

    const [posts, upvotedIds, ads] = await Promise.all([
        getOpenlabPosts(),
        session ? getUserUpvotes(Number(session.userId)) : Promise.resolve([] as string[]),
        getAdsForUser(sessionUser?.prefecture ?? "", sessionUser?.sport ?? undefined),
    ]);

    return (
        <OpenlabClient
            initialPosts={posts}
            initialUpvotedIds={upvotedIds}
            canPost={Boolean(session)}
            ads={ads}
        />
    );
}

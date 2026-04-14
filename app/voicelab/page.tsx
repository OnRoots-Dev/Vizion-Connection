import { getVoiceLabPosts, getVoiceLabUserUpvotes } from "@/lib/voicelab";
import VoiceLabClient from "./VoiceLabClient";
import { getOptionalSessionUser } from "@/lib/auth/get-optional-session-user";
import { getAdsForUser } from "@/lib/ads";

export const dynamic = "force-dynamic";

export default async function VoiceLabPage() {
    const sessionUser = await getOptionalSessionUser();
    const session = sessionUser ? { userId: String(sessionUser.id) } : null;
    const canManageVoiceLab = sessionUser?.role === "Admin";

    const [posts, upvotedIds, ads] = await Promise.all([
        getVoiceLabPosts(),
        session ? getVoiceLabUserUpvotes(Number(session.userId)) : Promise.resolve([] as string[]),
        getAdsForUser(sessionUser?.prefecture ?? "", sessionUser?.sport ?? undefined),
    ]);

    return (
        <VoiceLabClient
            initialPosts={posts}
            initialUpvotedIds={upvotedIds}
            canPost={Boolean(session)}
            ads={ads}
            canManageVoiceLab={canManageVoiceLab}
        />
    );
}

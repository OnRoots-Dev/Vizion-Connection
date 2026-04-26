import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { getCareerProfile } from "@/lib/supabase/career-profiles";
import { getCollectorCount } from "@/lib/supabase/collections";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = _req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;
  const result = await getPublicProfileBySlug(slug, session?.slug ?? null);

  if (!result.success) {
    const status = result.reason === "forbidden" ? 403 : 404;
    return NextResponse.json({ success: false, reason: result.reason }, { status });
  }

  const [careerProfile, collectorCount] = await Promise.all([
    getCareerProfile(slug),
    getCollectorCount(slug),
  ]);

  const canExposeCareer = session?.slug === slug || careerProfile?.visibility === "public";

  return NextResponse.json({
    success: true,
    profile: result.data,
    careerProfile: canExposeCareer ? careerProfile : null,
    collectorCount,
  });
}

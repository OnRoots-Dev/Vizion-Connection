import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { getCareerProfile } from "@/lib/supabase/career-profiles";
import { getCollectorCount } from "@/lib/supabase/collections";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSupabaseProfile();
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

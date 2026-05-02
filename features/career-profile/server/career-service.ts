import { getCareerProfile, upsertCareerProfile } from "@/lib/supabase/career-profiles";

export type CareerProfileUpsertInput = {
  tagline?: string;
  bioCareer?: string;
  countryCode?: string;
  countryName?: string;
  stats?: { value: string; label: string; color: "default" | "gold" | "role" }[];
  episodes?: {
    id?: string;
    period: string;
    role: string;
    org: string;
    desc: string;
    milestone?: string;
    tags: string[];
    isCurrent?: boolean;
  }[];
  skills?: { name: string; level: number; isHighlight?: boolean }[];
  ctaTitle?: string;
  ctaSub?: string;
  ctaBtn?: string;
  snsX?: string;
  snsInstagram?: string;
  snsTiktok?: string;
  visibility?: "public" | "members" | "private";
};

export async function getMyCareerProfile(userSlug: string) {
  return getCareerProfile(userSlug);
}

export async function saveMyCareerProfile(userSlug: string, input: CareerProfileUpsertInput): Promise<boolean> {
  return upsertCareerProfile(userSlug, {
    ...input,
    episodes: input.episodes?.map((ep) => ({
      ...ep,
      id: ep.id ?? "",
    })),
  });
}

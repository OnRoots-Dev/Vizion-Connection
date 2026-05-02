import { supabaseServer } from "@/lib/supabase/server";

const SELECT_WITH_SITE_URL =
  "id,user_slug,title,start_at,end_at,location,site_url,description,category,is_public,created_at,updated_at";
const SELECT_WITHOUT_SITE_URL =
  "id,user_slug,title,start_at,end_at,location,description,category,is_public,created_at,updated_at";

function isMissingColumnError(error: unknown, columnName: string) {
  const msg = String((error as any)?.message ?? "").toLowerCase();
  return msg.includes(columnName.toLowerCase()) && msg.includes("column");
}

export async function createScheduleForUser(input: {
  userSlug: string;
  title: string;
  category: string;
  start_at: string;
  end_at: string | null;
  location: string | null;
  site_url: string | null;
  description: string | null;
  is_public: boolean;
}) {
  const insertBase = {
    user_slug: input.userSlug,
    title: input.title,
    start_at: input.start_at,
    end_at: input.end_at,
    location: input.location,
    description: input.description,
    category: input.category,
    is_public: input.is_public,
  };

  const insertWithSite = { ...insertBase, site_url: input.site_url };

  let { data, error } = await supabaseServer
    .from("schedules")
    .insert(insertWithSite as any)
    .select(SELECT_WITH_SITE_URL as any)
    .single();

  if (error && isMissingColumnError(error, "site_url")) {
    ({ data, error } = await supabaseServer
      .from("schedules")
      .insert(insertBase as any)
      .select(SELECT_WITHOUT_SITE_URL as any)
      .single());
  }

  if (error) {
    throw error;
  }

  return data;
}

export async function updateScheduleForUser(input: {
  userSlug: string;
  id: string;
  title: string;
  category: string;
  start_at: string;
  end_at: string | null;
  location: string | null;
  site_url: string | null;
  description: string | null;
  is_public: boolean;
}) {
  const updateBase = {
    title: input.title,
    start_at: input.start_at,
    end_at: input.end_at,
    location: input.location,
    description: input.description,
    category: input.category,
    is_public: input.is_public,
  };

  const updateWithSite = { ...updateBase, site_url: input.site_url };

  let { data, error } = await supabaseServer
    .from("schedules")
    .update(updateWithSite as any)
    .eq("id", input.id)
    .eq("user_slug", input.userSlug)
    .select(SELECT_WITH_SITE_URL as any)
    .maybeSingle();

  if (error && isMissingColumnError(error, "site_url")) {
    ({ data, error } = await supabaseServer
      .from("schedules")
      .update(updateBase as any)
      .eq("id", input.id)
      .eq("user_slug", input.userSlug)
      .select(SELECT_WITHOUT_SITE_URL as any)
      .maybeSingle());
  }

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function deleteScheduleForUser(input: { userSlug: string; id: string }) {
  const { data, error } = await supabaseServer
    .from("schedules")
    .delete()
    .eq("id", input.id)
    .eq("user_slug", input.userSlug)
    .select("id" as any);

  if (error) {
    throw error;
  }

  return data;
}

export async function checkScheduleOwnership(input: { id: string }) {
  const { data, error } = await supabaseServer
    .from("schedules")
    .select("id,user_slug" as any)
    .eq("id", input.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

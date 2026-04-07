import { supabaseServer as supabase } from "@/lib/supabase/server";

type DiscoveryEventType = "impression" | "detail_open" | "search";

export async function recordDiscoveryEvent(params: {
  viewerSlug?: string | null;
  targetSlug?: string | null;
  eventType: DiscoveryEventType;
  queryText?: string | null;
  source?: string;
}) {
  const { error } = await supabase.from("discovery_events").insert({
    viewer_slug: params.viewerSlug ?? null,
    target_slug: params.targetSlug ?? null,
    event_type: params.eventType,
    query_text: params.queryText ?? null,
    source: params.source ?? "dashboard",
  });

  if (error) {
    console.error("[recordDiscoveryEvent]", error);
  }
}

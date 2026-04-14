import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileRecord } from "@/lib/supabase/data/users.server";

export type TrainerHubClientStatus = "active" | "completed";
export type TrainerSessionStatus = "scheduled" | "completed" | "cancelled";

export type TrainerHubClient = {
  id: string;
  slug: string | null;
  name: string;
  status: TrainerHubClientStatus;
  lastActivityAt: string;
  sessionCount: number;
  averageRating: number | null;
  notes: string | null;
};

export type TrainerHubSession = {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  durationMinutes: number;
  summary: string;
  status: TrainerSessionStatus;
  bookingSource: "manual" | "future_booking";
};

export type TrainerHubReview = {
  id: string;
  clientName: string;
  rating: number;
  text: string | null;
  createdAt: string;
};

export type TrainerHubSummary = {
  performance: {
    coachedClients: number;
    retentionRate: number;
    sessionsCount: number;
    averageRating: number;
    reviews: TrainerHubReview[];
  };
  clients: TrainerHubClient[];
  sessions: TrainerHubSession[];
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export async function getTrainerHubSummary(profile: ProfileRecord): Promise<TrainerHubSummary> {
  const [clientsRes, sessionsRes, reviewsRes] = await Promise.all([
    supabaseServer
      .from("trainer_clients")
      .select("id, client_slug, client_name, status, notes, last_activity_at")
      .eq("trainer_slug", profile.slug)
      .order("last_activity_at", { ascending: false }),
    supabaseServer
      .from("trainer_sessions")
      .select("id, trainer_client_id, session_date, duration_minutes, summary, session_status, booking_source")
      .eq("trainer_slug", profile.slug)
      .order("session_date", { ascending: false }),
    supabaseServer
      .from("trainer_reviews")
      .select("id, trainer_client_id, rating, review_text, created_at")
      .eq("trainer_slug", profile.slug)
      .order("created_at", { ascending: false }),
  ]);

  if (clientsRes.error) console.error("[getTrainerHubSummary.clients]", clientsRes.error);
  if (sessionsRes.error) console.error("[getTrainerHubSummary.sessions]", sessionsRes.error);
  if (reviewsRes.error) console.error("[getTrainerHubSummary.reviews]", reviewsRes.error);

  const clients = clientsRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const reviews = reviewsRes.data ?? [];

  const sessionCountByClient = new Map<string, number>();
  for (const session of sessions) {
    const key = String(session.trainer_client_id);
    sessionCountByClient.set(key, (sessionCountByClient.get(key) ?? 0) + 1);
  }

  const reviewStatsByClient = new Map<string, { total: number; count: number }>();
  for (const review of reviews) {
    const key = String(review.trainer_client_id);
    const current = reviewStatsByClient.get(key) ?? { total: 0, count: 0 };
    current.total += Number(review.rating ?? 0);
    current.count += 1;
    reviewStatsByClient.set(key, current);
  }

  const clientsList: TrainerHubClient[] = clients.map((client) => {
    const reviewStats = reviewStatsByClient.get(String(client.id));
    return {
      id: String(client.id),
      slug: client.client_slug ? String(client.client_slug) : null,
      name: String(client.client_name),
      status: String(client.status) as TrainerHubClientStatus,
      lastActivityAt: String(client.last_activity_at),
      sessionCount: sessionCountByClient.get(String(client.id)) ?? 0,
      averageRating: reviewStats && reviewStats.count > 0 ? round1(reviewStats.total / reviewStats.count) : null,
      notes: client.notes ? String(client.notes) : null,
    };
  });

  const clientNameMap = new Map(clientsList.map((client) => [client.id, client.name]));

  const sessionsList: TrainerHubSession[] = sessions.map((session) => ({
    id: String(session.id),
    clientId: String(session.trainer_client_id),
    clientName: clientNameMap.get(String(session.trainer_client_id)) ?? "Unknown Client",
    date: String(session.session_date),
    durationMinutes: Number(session.duration_minutes ?? 60),
    summary: String(session.summary ?? ""),
    status: String(session.session_status) as TrainerSessionStatus,
    bookingSource: String(session.booking_source ?? "manual") as "manual" | "future_booking",
  }));

  const reviewsList: TrainerHubReview[] = reviews.slice(0, 8).map((review) => ({
    id: String(review.id),
    clientName: clientNameMap.get(String(review.trainer_client_id)) ?? "Unknown Client",
    rating: Number(review.rating ?? 0),
    text: review.review_text ? String(review.review_text) : null,
    createdAt: String(review.created_at),
  }));

  const completedClients = clientsList.filter((client) => client.status === "completed").length;
  const retainedClients = clientsList.filter((client) => client.sessionCount >= 2 || client.status === "active").length;
  const retentionBase = clientsList.length > 0 ? clientsList.length : 1;
  const averageRating = reviews.length > 0
    ? round1(reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / reviews.length)
    : 0;

  return {
    performance: {
      coachedClients: clientsList.length,
      retentionRate: clientsList.length === 0 ? 0 : Math.round((retainedClients / retentionBase) * 100),
      sessionsCount: sessionsList.filter((session) => session.status !== "cancelled").length,
      averageRating,
      reviews: reviewsList,
    },
    clients: clientsList,
    sessions: sessionsList,
  };
}

async function findOrCreateTrainerClient(profile: ProfileRecord, input: {
  clientId?: string | null;
  clientSlug?: string | null;
  clientName: string;
  status?: TrainerHubClientStatus;
}) {
  if (input.clientId) {
    const { data, error } = await supabaseServer
      .from("trainer_clients")
      .update({
        client_slug: input.clientSlug ?? null,
        client_name: input.clientName,
        status: input.status ?? "active",
      })
      .eq("id", input.clientId)
      .eq("trainer_slug", profile.slug)
      .select("id")
      .single();
    if (error || !data) throw new Error("クライアント情報を更新できませんでした");
    return String(data.id);
  }

  const { data, error } = await supabaseServer
    .from("trainer_clients")
    .insert({
      trainer_slug: profile.slug,
      client_slug: input.clientSlug ?? null,
      client_name: input.clientName,
      status: input.status ?? "active",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("クライアント情報を保存できませんでした");
  return String(data.id);
}

export async function createTrainerSession(profile: ProfileRecord, input: {
  clientId?: string | null;
  clientSlug?: string | null;
  clientName: string;
  clientStatus?: TrainerHubClientStatus;
  date: string;
  durationMinutes: number;
  summary: string;
  status: TrainerSessionStatus;
}) {
  const trainerClientId = await findOrCreateTrainerClient(profile, {
    clientId: input.clientId ?? null,
    clientSlug: input.clientSlug ?? null,
    clientName: input.clientName,
    status: input.clientStatus ?? (input.status === "completed" ? "completed" : "active"),
  });

  const { data, error } = await supabaseServer
    .from("trainer_sessions")
    .insert({
      trainer_slug: profile.slug,
      trainer_client_id: trainerClientId,
      session_date: new Date(input.date).toISOString(),
      duration_minutes: input.durationMinutes,
      summary: input.summary,
      session_status: input.status,
      booking_source: "manual",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("セッションを追加できませんでした");
  return getTrainerHubSummary(profile);
}

export async function updateTrainerSession(profile: ProfileRecord, sessionId: string, input: {
  clientId?: string | null;
  clientSlug?: string | null;
  clientName: string;
  clientStatus?: TrainerHubClientStatus;
  date: string;
  durationMinutes: number;
  summary: string;
  status: TrainerSessionStatus;
}) {
  const { data: existing, error: existingError } = await supabaseServer
    .from("trainer_sessions")
    .select("trainer_client_id")
    .eq("id", sessionId)
    .eq("trainer_slug", profile.slug)
    .single();
  if (existingError || !existing) throw new Error("セッションが見つかりませんでした");

  const trainerClientId = await findOrCreateTrainerClient(profile, {
    clientId: input.clientId ?? String(existing.trainer_client_id),
    clientSlug: input.clientSlug ?? null,
    clientName: input.clientName,
    status: input.clientStatus ?? (input.status === "completed" ? "completed" : "active"),
  });

  const { error } = await supabaseServer
    .from("trainer_sessions")
    .update({
      trainer_client_id: trainerClientId,
      session_date: new Date(input.date).toISOString(),
      duration_minutes: input.durationMinutes,
      summary: input.summary,
      session_status: input.status,
    })
    .eq("id", sessionId)
    .eq("trainer_slug", profile.slug);
  if (error) throw new Error("セッションを更新できませんでした");

  return getTrainerHubSummary(profile);
}

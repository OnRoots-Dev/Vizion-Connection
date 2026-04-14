"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { HubAdPanel } from "@/app/(app)/dashboard/components/HubAdPanel";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { TrainerHubClient, TrainerHubSession, TrainerHubSummary } from "@/lib/supabase/trainer-hub";
import type { AdItem } from "@/lib/ads-shared";

const numberFormatter = new Intl.NumberFormat("ja-JP");

const emptySummary: TrainerHubSummary = {
  performance: { coachedClients: 0, retentionRate: 0, sessionsCount: 0, averageRating: 0, reviews: [] },
  clients: [],
  sessions: [],
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function loadTrainerHub() {
  const response = await fetch("/api/trainer-hub/summary", { cache: "no-store" });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "Trainer Hub の読み込みに失敗しました");
  }
  return (json.summary ?? emptySummary) as TrainerHubSummary;
}

export function TrainerHubView({
  profile,
  t,
  roleColor,
  setView,
  ads,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  ads: AdItem[];
}) {
  const [summary, setSummary] = useState<TrainerHubSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    clientSlug: "",
    clientName: "",
    clientStatus: "active" as "active" | "completed",
    date: "",
    durationMinutes: "60",
    summary: "",
    status: "completed" as "scheduled" | "completed" | "cancelled",
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await loadTrainerHub();
        if (active) setSummary(next);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Trainer Hub の読み込みに失敗しました");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    const channel = supabaseBrowser
      .channel(`trainer_hub_${profile.slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "trainer_clients", filter: `trainer_slug=eq.${profile.slug}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "trainer_sessions", filter: `trainer_slug=eq.${profile.slug}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "trainer_reviews", filter: `trainer_slug=eq.${profile.slug}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabaseBrowser.removeChannel(channel);
    };
  }, [profile.slug]);

  const selectedClient = useMemo(
    () => summary.clients.find((client) => client.id === selectedClientId) ?? null,
    [selectedClientId, summary.clients],
  );

  function startNewSession() {
    setEditingSessionId(null);
    setForm({
      clientId: selectedClient?.id ?? "",
      clientSlug: selectedClient?.slug ?? "",
      clientName: selectedClient?.name ?? "",
      clientStatus: selectedClient?.status ?? "active",
      date: new Date().toISOString().slice(0, 16),
      durationMinutes: "60",
      summary: "",
      status: "completed",
    });
  }

  function startEditSession(session: TrainerHubSession) {
    const client = summary.clients.find((item) => item.id === session.clientId);
    setEditingSessionId(session.id);
    setForm({
      clientId: session.clientId,
      clientSlug: client?.slug ?? "",
      clientName: session.clientName,
      clientStatus: client?.status ?? "active",
      date: new Date(session.date).toISOString().slice(0, 16),
      durationMinutes: String(session.durationMinutes),
      summary: session.summary,
      status: session.status,
    });
  }

  async function submitSession() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        clientId: form.clientId || undefined,
        clientSlug: form.clientSlug || undefined,
        clientName: form.clientName,
        clientStatus: form.clientStatus,
        date: new Date(form.date).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        summary: form.summary,
        status: form.status,
      };

      const response = await fetch(
        editingSessionId ? `/api/trainer-hub/sessions/${editingSessionId}` : "/api/trainer-hub/sessions",
        {
          method: editingSessionId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof json?.error === "string" ? json.error : "保存に失敗しました");
      }
      setSummary((json.summary ?? emptySummary) as TrainerHubSummary);
      setEditingSessionId(null);
      startNewSession();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  const sessionOptions = summary.clients;
  const reviewList = summary.performance.reviews;
  const clientSessions = selectedClient ? summary.sessions.filter((session) => session.clientId === selectedClient.id) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Trainer Hub" sub="信頼と実績を管理する" onBack={() => setView("home")} t={t} roleColor={roleColor} />
      <HubAdPanel ads={ads} t={t} />

      {loading ? (
        <SectionCard t={t}><p style={{ margin: 0, fontSize: 12, color: t.sub }}>Trainer Hub を読み込み中...</p></SectionCard>
      ) : error ? (
        <SectionCard t={t}><p style={{ margin: 0, fontSize: 12, color: "#ff9b9b" }}>{error}</p></SectionCard>
      ) : (
        <>
          <SectionCard t={t} accentColor={roleColor}>
            <SLabel text="Performance" color={roleColor} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {[
                { label: "指導人数", value: numberFormatter.format(summary.performance.coachedClients), detail: "担当クライアント" },
                { label: "継続率", value: `${summary.performance.retentionRate}%`, detail: "継続または2回以上" },
                { label: "セッション数", value: numberFormatter.format(summary.performance.sessionsCount), detail: "累計実施数" },
                { label: "評価", value: summary.performance.averageRating > 0 ? summary.performance.averageRating.toFixed(1) : "-", detail: "平均レビュー" },
              ].map((item) => (
                <div key={item.label} style={{ padding: 16, borderRadius: 16, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: 10, color: t.sub }}>{item.label}</div>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: t.text }}>{item.value}</div>
                  <div style={{ marginTop: 4, fontSize: 10, color: roleColor }}>{item.detail}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {reviewList.length === 0 ? (
                <div style={{ padding: 16, borderRadius: 14, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>
                  まだレビューがありません。今後レビュー入力機能と連携すると、ここに評価履歴が表示されます。
                </div>
              ) : reviewList.map((review) => (
                <div key={review.id} style={{ padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{review.clientName}</div>
                    <div style={{ fontSize: 11, color: "#FFD600" }}>★ {review.rating.toFixed(1)}</div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: t.sub }}>{review.text || "レビュー本文は未入力です"}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard t={t}>
            <SLabel text="Clients" color={roleColor} />
            <div style={{ display: "grid", gap: 10 }}>
              {summary.clients.length === 0 ? (
                <div style={{ padding: 16, borderRadius: 14, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>
                  まだクライアントがいません。下の Sessions から最初のセッションを追加すると、自動で紐づいたクライアントが作成されます。
                </div>
              ) : summary.clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                  style={{ textAlign: "left", padding: 14, borderRadius: 14, border: `1px solid ${selectedClientId === client.id ? `${roleColor}45` : t.border}`, background: selectedClientId === client.id ? `${roleColor}12` : "rgba(255,255,255,0.025)", color: t.text, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900 }}>{client.name}</div>
                      <div style={{ marginTop: 4, fontSize: 11, color: t.sub }}>
                        {client.status === "active" ? "進行中" : "完了"} · 最終活動 {formatDateTime(client.lastActivityAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 11, color: t.sub }}>
                      <div>{client.sessionCount} sessions</div>
                      <div>{client.averageRating ? `★ ${client.averageRating.toFixed(1)}` : "レビュー待ち"}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {selectedClient ? (
              <div style={{ marginTop: 14, padding: 16, borderRadius: 16, border: `1px solid ${roleColor}30`, background: `${roleColor}10` }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: t.text }}>{selectedClient.name}</div>
                <div style={{ marginTop: 6, fontSize: 11, color: t.sub }}>
                  ステータス: {selectedClient.status === "active" ? "進行中" : "完了"} / 最終活動: {formatDateTime(selectedClient.lastActivityAt)}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: t.sub }}>
                  {selectedClient.notes || "メモはまだありません。将来のクライアント詳細・進捗メモと連携できます。"}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: roleColor }}>
                  累計セッション {selectedClient.sessionCount}回
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard t={t} accentColor={roleColor}>
            <SLabel text="Sessions" color={roleColor} />
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                  <span>クライアント</span>
                  <select value={form.clientId} onChange={(e) => {
                    const client = sessionOptions.find((item) => item.id === e.target.value);
                    setForm((current) => ({
                      ...current,
                      clientId: e.target.value,
                      clientSlug: client?.slug ?? "",
                      clientName: client?.name ?? current.clientName,
                      clientStatus: client?.status ?? current.clientStatus,
                    }));
                  }} style={{ padding: "11px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text }}>
                    <option value="">新規または手入力</option>
                    {sessionOptions.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                  <span>クライアント名</span>
                  <input value={form.clientName} onChange={(e) => setForm((current) => ({ ...current, clientName: e.target.value }))} style={{ padding: "11px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text }} />
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                  <span>日付</span>
                  <input type="datetime-local" value={form.date} onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))} style={{ padding: "11px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text }} />
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                  <span>時間(分)</span>
                  <input type="number" min="15" max="480" value={form.durationMinutes} onChange={(e) => setForm((current) => ({ ...current, durationMinutes: e.target.value }))} style={{ padding: "11px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text }} />
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                  <span>クライアント状態</span>
                  <select value={form.clientStatus} onChange={(e) => setForm((current) => ({ ...current, clientStatus: e.target.value as "active" | "completed" }))} style={{ padding: "11px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text }}>
                    <option value="active">進行中</option>
                    <option value="completed">完了</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                  <span>セッション状態</span>
                  <select value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as "scheduled" | "completed" | "cancelled" }))} style={{ padding: "11px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text }}>
                    <option value="completed">完了</option>
                    <option value="scheduled">予定</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                </label>
              </div>
              <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                <span>内容</span>
                <textarea value={form.summary} onChange={(e) => setForm((current) => ({ ...current, summary: e.target.value }))} style={{ minHeight: 92, resize: "vertical", padding: "11px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text }} />
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" onClick={() => void submitSession()} disabled={saving || !form.clientName.trim() || !form.summary.trim() || !form.date} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: roleColor, color: "#04110a", fontWeight: 800, cursor: saving ? "progress" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {editingSessionId ? "セッションを更新" : "新規追加"}
                </button>
                <button type="button" onClick={() => startNewSession()} style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontWeight: 700, cursor: "pointer" }}>
                  入力をリセット
                </button>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {(selectedClient ? clientSessions : summary.sessions).length === 0 ? (
                  <div style={{ padding: 16, borderRadius: 14, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>
                    まだセッション履歴がありません。最初のセッションを追加すると、実績とクライアント一覧に自動反映されます。
                  </div>
                ) : (selectedClient ? clientSessions : summary.sessions).map((session) => (
                  <div key={session.id} style={{ padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{session.clientName}</div>
                        <div style={{ marginTop: 4, fontSize: 11, color: t.sub }}>
                          {formatDateTime(session.date)} / {session.durationMinutes}分 / {session.status === "completed" ? "完了" : session.status === "scheduled" ? "予定" : "キャンセル"}
                        </div>
                      </div>
                      <button type="button" onClick={() => startEditSession(session)} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        編集
                      </button>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>{session.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}

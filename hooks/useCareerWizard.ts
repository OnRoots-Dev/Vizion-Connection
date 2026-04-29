// hooks/useCareerWizard.ts
"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  CareerWizardState,
  CareerEpisode,
  CareerSkill,
  UserRole,
} from "@/types/career";
import { ROLE_CONFIG } from "@/types/career";

// ─── Step definitions ──────────────────────────────────────

export const STEPS = [
  { id: "role",          label: "役割",            phase: 0, skippable: false },
  { id: "profile_basic", label: "プロフィール情報", phase: 0, skippable: false },
  { id: "profile_media", label: "プロフィール画像", phase: 0, skippable: true },
  { id: "tagline",       label: "キャッチコピー",   phase: 0, skippable: true  },
  { id: "location",      label: "活動拠点",        phase: 0, skippable: true  },
  { id: "bio",           label: "自己紹介",        phase: 1, skippable: true  },
  { id: "stats",         label: "数値実績",        phase: 1, skippable: true  },
  { id: "episodes",      label: "年表",            phase: 1, skippable: true  },
  { id: "skills",        label: "スキル",          phase: 2, skippable: true  },
  { id: "contact",       label: "連絡先",          phase: 2, skippable: true  },
  { id: "career_media",  label: "キャリア画像",    phase: 2, skippable: true  },
  { id: "complete",      label: "完成",            phase: 2, skippable: false },
] as const;

export type StepId = (typeof STEPS)[number]["id"];
export const PHASE_LABELS = ["基本設定", "キャリア詳細", "スキル・仕上げ"];
export const TOTAL_STEPS = STEPS.length - 1; // "complete" は index 8

// ─── Initial state ─────────────────────────────────────────

const INITIAL_DATA: CareerWizardState = {
  // users テーブルから読み込む
  role: "",
  name: "",
  slug: "",
  sport: "",
  existingRegion: "",

  // profile（編集対象）
  displayName: "",
  bio: "",
  region: "",
  prefecture: "",
  sportsCategory: "",
  sportProfile: "",
  stance: "",
  instagram: "",
  xUrl: "",
  tiktok: "",
  profileImageUrl: "",
  avatarUrl: "",
  isPublic: true,

  careerImageUrl: "",

  // career_profiles テーブルへ保存
  tagline: "",
  bioCareer: "",
  countryCode: "JP",
  countryName: "日本",
  stats: [
    { value: "", label: "", color: "role" },
    { value: "", label: "", color: "default" },
    { value: "", label: "Cheer", color: "gold" },
  ],
  episodes: [],
  skills: [],
  ctaTitle: "",
  ctaSub: "",
  ctaBtn: "",
  snsX: "",
  snsInstagram: "",
  snsTiktok: "",
  visibility: "public",
};

// ─── Store type ────────────────────────────────────────────

interface WizardStore {
  currentStepIndex: number;
  isSaving: boolean;
  saveError: string | null;

  data: CareerWizardState;
  editingEpisode: CareerEpisode | null;
  isEpisodeModalOpen: boolean;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (i: number) => void;
  skipStep: () => void;

  // Data setters
  setField: <K extends keyof CareerWizardState>(k: K, v: CareerWizardState[K]) => void;
  setRole: (role: UserRole) => void;
  setStat: (i: number, key: "value" | "label", v: string) => void;
  initFromUser: (user: {
    role: UserRole;
    name: string;
    slug: string;
    sport?: string;
    region?: string;
    prefecture?: string;
    sportsCategory?: string;
    stance?: string;
    bio?: string;
    displayName?: string;
    profileImageUrl?: string;
    avatarUrl?: string | null;
    isPublic?: boolean;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
  }) => void;
  initFromCareerProfile: (cp: {
    tagline?: string | null;
    bio_career?: string | null;
    country_code?: string;
    country_name?: string | null;
    stats?: CareerWizardState["stats"];
    episodes?: CareerEpisode[];
    skills?: CareerSkill[];
    cta_title?: string | null;
    cta_sub?: string | null;
    cta_btn?: string | null;
    sns_x?: string | null;
    sns_instagram?: string | null;
    sns_tiktok?: string | null;
    visibility?: "public" | "members" | "private";
  }) => void;

  // Episodes
  openNewEpisode: () => void;
  openEditEpisode: (id: string) => void;
  closeEpisodeModal: () => void;
  saveEpisode: (ep: Omit<CareerEpisode, "id">) => void;
  deleteEpisode: (id: string) => void;

  // Skills
  setSkillLevel: (name: string, level: number) => void;
  toggleSkillHighlight: (name: string) => void;
  addSkill: (name: string) => void;
  removeSkill: (name: string) => void;

  // Persistence
  saveToApi: () => Promise<boolean>;
  resetWizard: () => void;

  // Computed
  progressPct: () => number;
  currentPhase: () => number;
  roleColor: () => string;
  isCurrentStepSkippable: () => boolean;
}

// ─── Store ─────────────────────────────────────────────────

export const useCareerWizard = create<WizardStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentStepIndex: 0,
        isSaving: false,
        saveError: null,
        data: INITIAL_DATA,
        editingEpisode: null,
        isEpisodeModalOpen: false,

        // ── Navigation ────────────────────────────────
        nextStep: () => {
          const i = get().currentStepIndex;
          if (i < STEPS.length - 1) set({ currentStepIndex: i + 1 });
        },
        prevStep: () => {
          const i = get().currentStepIndex;
          if (i > 0) set({ currentStepIndex: i - 1 });
        },
        goToStep: (i) => {
          if (i >= 0 && i < STEPS.length) set({ currentStepIndex: i });
        },
        skipStep: () => get().nextStep(),

        // ── Data setters ──────────────────────────────
        setField: (k, v) =>
          set((s) => ({ data: { ...s.data, [k]: v } })),

        setRole: (role) => {
          const cfg = ROLE_CONFIG[role];
          // ロール変更時にデフォルトスキル・statsをセット
          const skills: CareerSkill[] = cfg.skills.map((s) => ({
            name: s.name,
            level: s.defaultLevel,
            isHighlight: s.highlight ?? false,
          }));
          const stats = cfg.stats.map((s) => ({
            value: "",
            label: s.label,
            color: s.color,
          }));
          set((prev) => ({
            data: { ...prev.data, role, stats, skills },
          }));
        },

        setStat: (i, key, v) =>
          set((s) => {
            const stats = [...s.data.stats];
            stats[i] = { ...stats[i], [key]: v };
            return { data: { ...s.data, stats } };
          }),

        // usersテーブルのデータを読み込む（読み取り専用）
        initFromUser: (user) =>
          set((s) => ({
            data: {
              ...s.data,
              role: user.role,
              name: user.name,
              slug: user.slug,
              sport: user.sport ?? "",
              existingRegion: user.region ?? "",
              displayName: user.displayName ?? user.name,
              bio: user.bio ?? "",
              region: user.region ?? "",
              prefecture: user.prefecture ?? "",
              sportsCategory: user.sportsCategory ?? "",
              sportProfile: user.sport ?? "",
              stance: user.stance ?? "",
              instagram: user.instagram ?? "",
              xUrl: user.xUrl ?? "",
              tiktok: user.tiktok ?? "",
              profileImageUrl: user.profileImageUrl ?? "",
              avatarUrl: user.avatarUrl ?? "",
              isPublic: user.isPublic !== false,

              // career側にも SNS を反映（公開ページのCTA用）
              snsX: user.xUrl ?? "",
              snsInstagram: user.instagram ?? "",
              snsTiktok: user.tiktok ?? "",
            },
          })),

        // career_profilesテーブルのデータを読み込む
        initFromCareerProfile: (cp) =>
          set((s) => ({
            data: {
              ...s.data,
              tagline:     cp.tagline      ?? s.data.tagline,
              bioCareer:   cp.bio_career   ?? s.data.bioCareer,
              countryCode: cp.country_code ?? s.data.countryCode,
              countryName: cp.country_name ?? s.data.countryName,
              stats:       cp.stats        ?? s.data.stats,
              episodes:    cp.episodes     ?? s.data.episodes,
              skills:      cp.skills       ?? s.data.skills,
              ctaTitle:    cp.cta_title    ?? s.data.ctaTitle,
              ctaSub:      cp.cta_sub      ?? s.data.ctaSub,
              ctaBtn:      cp.cta_btn      ?? s.data.ctaBtn,
              snsX:        cp.sns_x        ?? s.data.snsX,
              snsInstagram: cp.sns_instagram ?? s.data.snsInstagram,
              snsTiktok:   cp.sns_tiktok   ?? s.data.snsTiktok,
              visibility:  cp.visibility   ?? s.data.visibility,
            },
          })),

        // ── Episodes ──────────────────────────────────
        openNewEpisode: () =>
          set({
            editingEpisode: {
              id: "", period: "", role: "", org: "",
              desc: "", milestone: "", tags: [], isCurrent: false,
            },
            isEpisodeModalOpen: true,
          }),

        openEditEpisode: (id) => {
          const ep = get().data.episodes.find((e) => e.id === id);
          if (ep) set({ editingEpisode: { ...ep }, isEpisodeModalOpen: true });
        },

        closeEpisodeModal: () =>
          set({ isEpisodeModalOpen: false, editingEpisode: null }),

        saveEpisode: (epData) =>
          set((s) => {
            const existingId = s.editingEpisode?.id;
            const id = existingId || nanoid(8);
            const ep: CareerEpisode = { ...epData, id };
            const episodes = existingId
              ? s.data.episodes.map((e) => (e.id === existingId ? ep : e))
              : [...s.data.episodes, ep];
            return {
              data: { ...s.data, episodes },
              isEpisodeModalOpen: false,
              editingEpisode: null,
            };
          }),

        deleteEpisode: (id) =>
          set((s) => ({
            data: {
              ...s.data,
              episodes: s.data.episodes.filter((e) => e.id !== id),
            },
          })),

        // ── Skills ────────────────────────────────────
        setSkillLevel: (name, level) =>
          set((s) => ({
            data: {
              ...s.data,
              skills: s.data.skills.map((sk) =>
                sk.name === name ? { ...sk, level } : sk
              ),
            },
          })),

        toggleSkillHighlight: (name) =>
          set((s) => ({
            data: {
              ...s.data,
              skills: s.data.skills.map((sk) =>
                sk.name === name ? { ...sk, isHighlight: !sk.isHighlight } : sk
              ),
            },
          })),

        addSkill: (name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          if (get().data.skills.find((s) => s.name === trimmed)) return;
          set((s) => ({
            data: {
              ...s.data,
              skills: [
                ...s.data.skills,
                { name: trimmed, level: 70, isHighlight: false },
              ],
            },
          }));
        },

        removeSkill: (name) =>
          set((s) => ({
            data: {
              ...s.data,
              skills: s.data.skills.filter((sk) => sk.name !== name),
            },
          })),

        // ── API保存 ───────────────────────────────────
        saveToApi: async () => {
          set({ isSaving: true, saveError: null });
          try {
            const { data } = get();

            const profileRes = await fetch("/api/profile/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                displayName: data.displayName,
                bio: data.bio,
                region: data.region,
                prefecture: data.prefecture,
                sportsCategory: data.sportsCategory,
                sport: data.sportProfile,
                stance: data.stance,
                instagram: data.instagram,
                xUrl: data.xUrl,
                tiktok: data.tiktok,
                profileImageUrl: data.profileImageUrl,
                avatarUrl: data.avatarUrl,
                isPublic: data.isPublic,
              }),
            });
            if (!profileRes.ok) {
              const err = await profileRes.json().catch(() => ({}));
              set({ saveError: (err as any)?.error ?? "プロフィールの保存に失敗しました" });
              return false;
            }

            const res = await fetch("/api/career-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tagline:      data.tagline,
                bioCareer:    data.bioCareer,
                countryCode:  data.countryCode,
                countryName:  data.countryName,
                stats:        data.stats,
                episodes:     data.episodes,
                skills:       data.skills,
                ctaTitle:     data.ctaTitle,
                ctaSub:       data.ctaSub,
                ctaBtn:       data.ctaBtn,
                snsX:         data.snsX,
                snsInstagram: data.snsInstagram,
                snsTiktok:    data.snsTiktok,
                visibility:   data.visibility,
              }),
            });
            if (!res.ok) {
              const err = await res.json();
              set({ saveError: err.error ?? "保存に失敗しました" });
              return false;
            }
            return true;
          } catch (e) {
            console.error("[saveToApi]", e);
            set({ saveError: "ネットワークエラーが発生しました" });
            return false;
          } finally {
            set({ isSaving: false });
          }
        },

        resetWizard: () =>
          set({ data: INITIAL_DATA, currentStepIndex: 0, saveError: null }),

        // ── Computed ──────────────────────────────────
        progressPct: () =>
          Math.round((get().currentStepIndex / TOTAL_STEPS) * 100),
        currentPhase: () =>
          STEPS[get().currentStepIndex]?.phase ?? 0,
        roleColor: () => {
          const r = get().data.role as UserRole | "";
          return r ? (ROLE_CONFIG[r]?.color ?? "#C1272D") : "#C1272D";
        },
        isCurrentStepSkippable: () =>
          STEPS[get().currentStepIndex]?.skippable ?? false,
      }),
      {
        name: "vizion-career-draft", // localStorage key
        // UIステートは永続化しない、データのみ
        partialize: (s) => ({
          data: s.data,
          currentStepIndex: s.currentStepIndex,
        }),
      }
    ),
    { name: "CareerWizard" }
  )
);



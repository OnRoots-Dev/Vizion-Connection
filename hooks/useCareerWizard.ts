"use client";
// hooks/useCareerWizard.ts — Role-based Profile Onboarding store

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
import {
  getPhaseLabelsForRole,
  getStepsForRole,
  type WizardStepMeta,
} from "@/lib/career-wizard/flows";

export type { WizardStepMeta };
export { getStepsForRole, getPhaseLabelsForRole };

// ─── Initial state ─────────────────────────────────────────

const INITIAL_DATA: CareerWizardState = {
  role: "",
  name: "",
  slug: "",
  sport: "",
  existingRegion: "",

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
  youtube: "",
  website: "",
  profileImageUrl: "",
  avatarUrl: "",
  isPublic: true,
  claim: "",
  location: "",
  sports: [],

  careerImageUrl: "",

  businessLocationName: "",
  businessAddress: "",
  businessLatitude: "",
  businessLongitude: "",
  businessHours: "",
  businessPhone: "",
  businessWebsite: "",

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

function applyRoleDefaults(role: UserRole, _prev: CareerWizardState): Partial<CareerWizardState> {
  const cfg = ROLE_CONFIG[role];
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
  return { role, stats, skills };
}

// ─── Store type ────────────────────────────────────────────

interface WizardStore {
  currentStepIndex: number;
  isSaving: boolean;
  saveError: string | null;

  data: CareerWizardState;
  editingEpisode: CareerEpisode | null;
  isEpisodeModalOpen: boolean;

  getSteps: () => WizardStepMeta[];
  getTotalSteps: () => number;
  getCurrentStep: () => WizardStepMeta | undefined;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (i: number) => void;
  skipStep: () => void;

  setField: <K extends keyof CareerWizardState>(k: K, v: CareerWizardState[K]) => void;
  setStat: (i: number, key: "value" | "label", v: string) => void;
  toggleSportsItem: (item: string) => void;

  initFromUser: (user: {
    role: UserRole;
    name: string;
    slug: string;
    sport?: string;
    sports?: string[];
    region?: string;
    prefecture?: string;
    location?: string;
    sportsCategory?: string;
    stance?: string;
    bio?: string;
    claim?: string;
    displayName?: string;
    profileImageUrl?: string;
    avatarUrl?: string | null;
    isPublic?: boolean;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
    website?: string;
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

  openNewEpisode: () => void;
  openEditEpisode: (id: string) => void;
  closeEpisodeModal: () => void;
  saveEpisode: (ep: Omit<CareerEpisode, "id">) => void;
  deleteEpisode: (id: string) => void;

  setSkillLevel: (name: string, level: number) => void;
  toggleSkillHighlight: (name: string) => void;
  addSkill: (name: string) => void;
  removeSkill: (name: string) => void;

  saveProfileToApi: () => Promise<boolean>;
  saveCareerToApi: () => Promise<boolean>;
  saveBusinessLocationToApi: () => Promise<boolean>;
  saveToApi: () => Promise<boolean>;
  resetWizard: () => void;

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

        getSteps: () => getStepsForRole(get().data.role as UserRole | ""),
        getTotalSteps: () => {
          const steps = get().getSteps();
          return Math.max(steps.length - 1, 1);
        },
        getCurrentStep: () => get().getSteps()[get().currentStepIndex],

        nextStep: () => {
          const steps = get().getSteps();
          const i = get().currentStepIndex;
          if (i < steps.length - 1) set({ currentStepIndex: i + 1 });
        },
        prevStep: () => {
          const i = get().currentStepIndex;
          if (i > 0) set({ currentStepIndex: i - 1 });
        },
        goToStep: (i) => {
          const steps = get().getSteps();
          if (i >= 0 && i < steps.length) set({ currentStepIndex: i });
        },
        skipStep: () => get().nextStep(),

        setField: (k, v) =>
          set((s) => ({ data: { ...s.data, [k]: v } })),

        setStat: (i, key, v) =>
          set((s) => {
            const stats = [...s.data.stats];
            stats[i] = { ...stats[i], [key]: v };
            return { data: { ...s.data, stats } };
          }),

        toggleSportsItem: (item) =>
          set((s) => {
            const sports = s.data.sports.includes(item)
              ? s.data.sports.filter((x) => x !== item)
              : [...s.data.sports, item];
            return { data: { ...s.data, sports } };
          }),

        initFromUser: (user) =>
          set((s) => {
            const roleDefaults = applyRoleDefaults(user.role, s.data);
            const tagline = user.claim ?? s.data.tagline;
            return {
              currentStepIndex: 0,
              data: {
                ...s.data,
                ...roleDefaults,
                role: user.role,
                name: user.name,
                slug: user.slug,
                sport: user.sport ?? "",
                existingRegion: user.region ?? "",
                displayName: user.displayName ?? user.name,
                bio: user.bio ?? "",
                region: user.region ?? "",
                prefecture: user.prefecture ?? "",
                location: user.location ?? "",
                sportsCategory: user.sportsCategory ?? "",
                sportProfile: user.sport ?? "",
                stance: user.stance ?? "",
                claim: user.claim ?? "",
                sports: user.sports ?? [],
                instagram: user.instagram ?? "",
                xUrl: user.xUrl ?? "",
                tiktok: user.tiktok ?? "",
                website: user.website ?? "",
                profileImageUrl: user.profileImageUrl ?? "",
                avatarUrl: user.avatarUrl ?? "",
                isPublic: user.isPublic !== false,
                tagline: tagline,
                snsX: user.xUrl ?? "",
                snsInstagram: user.instagram ?? "",
                snsTiktok: user.tiktok ?? "",
              },
            };
          }),

        initFromCareerProfile: (cp) =>
          set((s) => ({
            data: {
              ...s.data,
              tagline: cp.tagline ?? s.data.tagline,
              claim: cp.tagline ?? s.data.claim,
              bioCareer: cp.bio_career ?? s.data.bioCareer,
              countryCode: cp.country_code ?? s.data.countryCode,
              countryName: cp.country_name ?? s.data.countryName,
              stats: cp.stats ?? s.data.stats,
              episodes: cp.episodes ?? s.data.episodes,
              skills: cp.skills ?? s.data.skills,
              ctaTitle: cp.cta_title ?? s.data.ctaTitle,
              ctaSub: cp.cta_sub ?? s.data.ctaSub,
              ctaBtn: cp.cta_btn ?? s.data.ctaBtn,
              snsX: cp.sns_x ?? s.data.snsX,
              snsInstagram: cp.sns_instagram ?? s.data.snsInstagram,
              snsTiktok: cp.sns_tiktok ?? s.data.snsTiktok,
              visibility: cp.visibility ?? s.data.visibility,
            },
          })),

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

        saveProfileToApi: async () => {
          set({ isSaving: true, saveError: null });
          try {
            const { data } = get();
            const tagline = data.tagline || data.claim;

            const profileRes = await fetch("/api/profile/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                displayName: data.displayName,
                bio: data.bio,
                region: data.region,
                prefecture: data.prefecture,
                location: data.location,
                sportsCategory: data.sportsCategory,
                sport: data.sportProfile || data.sport,
                sports: data.sports,
                stance: data.stance,
                claim: tagline,
                instagram: data.instagram || data.snsInstagram,
                xUrl: data.xUrl || data.snsX,
                tiktok: data.tiktok || data.snsTiktok,
                profileImageUrl: data.profileImageUrl,
                avatarUrl: data.avatarUrl,
                isPublic: data.isPublic,
              }),
            });

            if (!profileRes.ok) {
              const err = await profileRes.json().catch(() => ({}));
              set({ saveError: (err as { error?: string })?.error ?? "プロフィールの保存に失敗しました" });
              return false;
            }
            return true;
          } catch (e) {
            console.error("[saveProfileToApi]", e);
            set({ saveError: "ネットワークエラーが発生しました" });
            return false;
          } finally {
            set({ isSaving: false });
          }
        },

        saveCareerToApi: async () => {
          set({ isSaving: true, saveError: null });
          try {
            const { data } = get();
            const tagline = data.tagline || data.claim;

            const res = await fetch("/api/career-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tagline,
                bioCareer: data.bioCareer || data.bio,
                countryCode: data.countryCode,
                countryName: data.countryName || data.prefecture || data.region,
                stats: data.stats.filter((s) => s.color !== "gold" || s.value),
                episodes: data.episodes,
                skills: data.skills,
                ctaTitle: data.ctaTitle,
                ctaSub: data.ctaSub,
                ctaBtn: data.ctaBtn,
                snsX: data.snsX || data.xUrl,
                snsInstagram: data.snsInstagram || data.instagram,
                snsTiktok: data.snsTiktok || data.tiktok,
                visibility: data.visibility,
              }),
            });

            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              set({ saveError: (err as { error?: string })?.error ?? "保存に失敗しました" });
              return false;
            }
            return true;
          } catch (e) {
            console.error("[saveCareerToApi]", e);
            set({ saveError: "ネットワークエラーが発生しました" });
            return false;
          } finally {
            set({ isSaving: false });
          }
        },

        saveBusinessLocationToApi: async () => {
          const { data } = get();
          if (data.role !== "Business") return true;
          const lat = parseFloat(data.businessLatitude);
          const lng = parseFloat(data.businessLongitude);
          if (!data.businessLocationName.trim() || !data.prefecture.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
            return true; // skip if incomplete (non-blocking for other roles' code path)
          }

          set({ isSaving: true, saveError: null });
          try {
            const res = await fetch("/api/business-monetize/locations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: data.businessLocationName,
                prefecture: data.prefecture,
                address: data.businessAddress || null,
                latitude: lat,
                longitude: lng,
                hours: data.businessHours || null,
                phone: data.businessPhone || null,
                website: data.businessWebsite || data.website || null,
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              set({ saveError: (err as { error?: string })?.error ?? "店舗情報の保存に失敗しました" });
              return false;
            }
            return true;
          } catch (e) {
            console.error("[saveBusinessLocationToApi]", e);
            set({ saveError: "ネットワークエラーが発生しました" });
            return false;
          } finally {
            set({ isSaving: false });
          }
        },

        saveToApi: async () => {
          const okProfile = await get().saveProfileToApi();
          if (!okProfile) return false;
          const okCareer = await get().saveCareerToApi();
          if (!okCareer) return false;
          const okBiz = await get().saveBusinessLocationToApi();
          return okBiz;
        },

        resetWizard: () =>
          set({ data: INITIAL_DATA, currentStepIndex: 0, saveError: null }),

        progressPct: () => {
          const total = get().getTotalSteps();
          return Math.round((get().currentStepIndex / total) * 100);
        },
        currentPhase: () =>
          get().getCurrentStep()?.phase ?? 0,
        roleColor: () => {
          const r = get().data.role as UserRole | "";
          return r ? (ROLE_CONFIG[r]?.color ?? "#C1272D") : "#C1272D";
        },
        isCurrentStepSkippable: () =>
          get().getCurrentStep()?.skippable ?? false,
      }),
      {
        name: "vizion-career-draft",
        partialize: (s) => ({
          data: s.data,
          currentStepIndex: s.currentStepIndex,
        }),
      }
    ),
    { name: "CareerWizard" }
  )
);

/** @deprecated Use getStepsForRole(role) — kept for backward compat during migration */
export const STEPS = getStepsForRole("Athlete");
export const PHASE_LABELS = getPhaseLabelsForRole("Athlete");
export const TOTAL_STEPS = STEPS.length - 1;

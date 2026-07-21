// app/(app)/dashboard/dev/components/ComponentGalleryClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pressable, PRESS_SCALE } from "@/components/ui/Pressable";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import CheerButton from "@/components/ui/CheerButton";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import { GestureSheet } from "@/components/ui/GestureSheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SkeletonAvatar } from "@/components/ui/skeleton/SkeletonAvatar";
import { SkeletonCard } from "@/components/ui/skeleton/SkeletonCard";
import { SkeletonList } from "@/components/ui/skeleton/SkeletonList";
import { SkeletonText } from "@/components/ui/skeleton/SkeletonText";
import {
  SectionCard,
  SLabel,
  ActionPill,
  ViewHeader,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  PulseIndicator,
  StatBlock,
  ViewLoader,
  CardHeader,
} from "@/app/(app)/dashboard/components/ui";
import { AuthAmbientBg } from "@/components/auth/AuthAmbientBg";
import {
  AuthPulseLoader,
  AuthSuccessMark,
  AuthIconBadge,
} from "@/components/auth/AuthStatusMotion";
import GlobalAdCard from "@/components/AdCard";
import NewsAdCard from "@/app/(app)/news-rooms/components/AdCard";
import CalendarHeader from "@/components/schedule/CalendarHeader";
import MiniCalendar from "@/components/schedule/MiniCalendar";
import {
  StepHeader,
  Field,
  WizardInput,
  WizardTextarea,
  WizardSelect,
} from "@/components/career-wizard/WizardUI";
import { THEME_MAP } from "@/app/(app)/dashboard/types";
import type { AdItem } from "@/lib/ads-shared";

const t = THEME_MAP.dark;

const MOCK_AD: AdItem = {
  id: "dev-gallery-ad",
  businessId: 0,
  plan: "signal",
  adSize: "medium",
  adScope: "national",
  region: null,
  planPriority: 1,
  prefecture: null,
  sportCategory: null,
  imageUrl: null,
  linkUrl: "https://vizion-connection.jp",
  headline: "ギャラリー用モック広告 — Signal プラン",
  bodyText: "本物の AdCard コンポーネントに渡しているデモデータです。",
  isActive: true,
  startsAt: new Date().toISOString(),
  endsAt: null,
  createdAt: new Date().toISOString(),
};

function Meta({
  name,
  path,
  used,
}: {
  name: string;
  path: string;
  used: string;
}) {
  return (
    <div className="mb-3 space-y-0.5 border-b border-white/10 pb-2">
      <p className="m-0 text-sm font-bold text-white">{name}</p>
      <p className="m-0 font-mono text-[10px] text-[#C8E800]/80">{path}</p>
      <p className="m-0 text-[11px] text-white/40">利用: {used}</p>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 border-l-2 border-[#C8E800] pl-3 text-lg font-black tracking-tight text-white">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#111118] p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function StateRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export default function ComponentGalleryClient({
  viewerRole,
  isDev,
}: {
  viewerRole: string;
  isDev: boolean;
}) {
  const [switchOn, setSwitchOn] = useState(true);
  const [animValue, setAnimValue] = useState(42);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [calSelected, setCalSelected] = useState(() => new Date());
  const [calView, setCalView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek">(
    "dayGridMonth",
  );
  const [wizardText, setWizardText] = useState("ギャラリー入力");
  const [wizardArea, setWizardArea] = useState("キャリア自己紹介のデモ");
  const [wizardSelect, setWizardSelect] = useState("a");

  return (
    <div className="min-h-screen bg-[#09090f] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="m-0 font-mono text-[10px] tracking-[0.2em] text-[#C8E800]">
            DEV ONLY · UI GALLERY
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Component Gallery
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
            実 import のコンポーネントを並べた開発確認用ページ。
            {isDev ? " 開発環境アクセス。" : " 本番は Admin のみ。"}
            閲覧ロール: <span className="text-white/70">{viewerRole}</span>
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-xs text-white/50 underline-offset-4 hover:text-white hover:underline"
          >
            ← Dashboard へ戻る
          </Link>
        </header>

        {/* ═══════════════════════════════════════════════
            比較: Button 系統
        ═══════════════════════════════════════════════ */}
        <Block title="比較 · Button 系統（隣り合わせ）">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <Meta
                name="Button (shadcn)"
                path="components/ui/button.tsx"
                used="Schedule (CalendarHeader/Sidebar), News ArticleSheet"
              />
              <StateRow label="default">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </StateRow>
              <StateRow label="disabled">
                <Button disabled>Disabled</Button>
              </StateRow>
              <StateRow label="sizes">
                <Button size="sm">SM</Button>
                <Button size="default">MD</Button>
                <Button size="lg">LG</Button>
              </StateRow>
            </Panel>

            <Panel>
              <Meta
                name="Primary / Secondary / Danger"
                path="app/(app)/dashboard/components/ui.tsx"
                used="現状ほぼ未使用（今後 dashboard inline 寄せ用）"
              />
              <StateRow label="default">
                <PrimaryButton onClick={() => undefined}>Primary</PrimaryButton>
                <SecondaryButton onClick={() => undefined}>Secondary</SecondaryButton>
                <DangerButton onClick={() => undefined}>Danger</DangerButton>
              </StateRow>
              <StateRow label="disabled">
                <PrimaryButton disabled>Primary</PrimaryButton>
                <SecondaryButton disabled>Secondary</SecondaryButton>
                <DangerButton disabled>Danger</DangerButton>
              </StateRow>
            </Panel>

            <Panel>
              <Meta
                name="Pressable"
                path="components/ui/Pressable.tsx"
                used="auth 系は PRESS_SCALE 定数利用、コンポーネント自体は少数"
              />
              <StateRow label="default">
                <Pressable className="rounded-lg bg-[#C8E800] px-4 py-2 text-sm font-bold text-black">
                  Press me (scale {PRESS_SCALE})
                </Pressable>
              </StateRow>
              <StateRow label="disabled">
                <Pressable
                  disabled
                  className="rounded-lg bg-[#C8E800] px-4 py-2 text-sm font-bold text-black opacity-50"
                >
                  Disabled
                </Pressable>
              </StateRow>
            </Panel>

            <Panel>
              <Meta
                name="ActionPill"
                path="app/(app)/dashboard/components/ui.tsx"
                used="Home 等"
              />
              <StateRow label="default">
                <ActionPill color="#C8E800" t={t} onClick={() => undefined}>
                  ACTION
                </ActionPill>
                <ActionPill color="#FF5050" t={t} onClick={() => undefined}>
                  ATHLETE
                </ActionPill>
                <ActionPill color="#3C8CFF" t={t} href="#gallery-top">
                  LINK
                </ActionPill>
              </StateRow>
            </Panel>
          </div>
        </Block>

        {/* ═══════════════════════════════════════════════
            比較: Card 系統
        ═══════════════════════════════════════════════ */}
        <Block title="比較 · Card 系統">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <Meta
                name="SectionCard + SLabel + CardHeader"
                path="app/(app)/dashboard/components/ui.tsx"
                used="Discovery / Cheer / Business / Home / Collections 等ほぼ全 dashboard view"
              />
              <SectionCard t={t} accentColor="#C8E800">
                <SLabel text="SECTION" color="#C8E800" />
                <CardHeader title="Sample Card" meta={<span className="text-xs text-white/40">meta</span>} />
                <p className="m-0 text-sm text-white/50">
                  ホバーでリフト（spring）。Dashboard SPA の標準カード面。
                </p>
              </SectionCard>
            </Panel>
            <Panel>
              <Meta
                name="auth ガラスカード（CSS パターン）"
                path="globals.css · .vc-auth-shell / inline glass"
                used="login / register / reset / thanks"
              />
              <div
                className="rounded-[20px] border border-white/[0.08] px-5 py-6"
                style={{
                  background: "rgba(10,10,10,0.72)",
                  backdropFilter: "blur(20px) saturate(160%)",
                }}
              >
                <p className="m-0 font-mono text-[10px] tracking-widest text-[#C8E800]">AUTH GLASS</p>
                <p className="mt-2 text-sm text-white/50">コンポーネントではなくパターン共有</p>
              </div>
            </Panel>
          </div>
        </Block>

        {/* ═══════════════════════════════════════════════
            components/ui/*
        ═══════════════════════════════════════════════ */}
        <Block title="A · components/ui/">
          <Panel>
            <Meta name="Switch" path="components/ui/switch.tsx" used="Admin PostEditor" />
            <StateRow label="on/off">
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              <span className="text-xs text-white/45">{switchOn ? "ON" : "OFF"}</span>
            </StateRow>
            <StateRow label="disabled">
              <Switch checked disabled onCheckedChange={() => undefined} />
              <Switch checked={false} disabled onCheckedChange={() => undefined} />
            </StateRow>
          </Panel>

          <Panel>
            <Meta
              name="AlertDialog"
              path="components/ui/alert-dialog.tsx"
              used="Admin PostsView"
            />
            <AlertDialog>
              <AlertDialogTrigger className="rounded-md bg-white/10 px-3 py-2 text-sm text-white">
                Open AlertDialog
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確認ダイアログ</AlertDialogTitle>
                  <AlertDialogDescription>
                    本物の AlertDialog コンポーネントです。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Panel>

          <Panel>
            <Meta name="Sheet (shadcn)" path="components/ui/sheet.tsx" used="News ArticleSheet" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet</SheetTitle>
                  <SheetDescription>Radix Sheet のデモ</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </Panel>

          <Panel>
            <Meta
              name="GestureSheet"
              path="components/ui/GestureSheet.tsx"
              used="ProfilePreviewModal"
            />
            <Button type="button" onClick={() => setSheetOpen(true)}>
              Open GestureSheet
            </Button>
            <GestureSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
              <div className="p-6 text-white">
                <p className="font-bold">GestureSheet デモ</p>
                <p className="mt-2 text-sm text-white/50">下にドラッグして閉じられます。</p>
                <Button className="mt-4" onClick={() => setSheetOpen(false)}>
                  閉じる
                </Button>
              </div>
            </GestureSheet>
          </Panel>

          <Panel>
            <Meta
              name="CheerButton"
              path="components/ui/CheerButton.tsx"
              used="CheerView, 公開プロフィール"
            />
            <p className="mb-2 text-[11px] text-white/35">
              isOwn=true で API を叩かない表示専用デモ
            </p>
            <CheerButton
              slug="dev_gallery"
              initialCount={12}
              roleColor="#FF5050"
              isOwn
              showCommentBox={false}
            />
          </Panel>

          <Panel>
            <Meta
              name="FoundingMemberBadge / EarlyPartnerBadge"
              path="components/ui/FoundingMemberBadge.tsx"
              used="ProfileCard, 公開プロフィール"
            />
            <div className="flex flex-wrap gap-3">
              <FoundingMemberBadge />
              <EarlyPartnerBadge />
            </div>
          </Panel>

          <Panel>
            <Meta
              name="Skeleton*"
              path="components/ui/skeleton/*"
              used="Home, Cheer, Discovery"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <SkeletonAvatar size={48} />
                <SkeletonText lines={3} />
              </div>
              <SkeletonCard height={100} />
            </div>
            <div className="mt-4">
              <SkeletonList rows={3} />
            </div>
          </Panel>

          <Panel>
            <Meta
              name="AnimatedNumber"
              path="components/ui/AnimatedNumber.tsx"
              used="BusinessCheckout"
            />
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-[#C8E800]">
                <AnimatedNumber value={animValue} />
              </span>
              <Button size="sm" onClick={() => setAnimValue((v) => v + 17)}>
                +17
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAnimValue(0)}>
                Reset
              </Button>
            </div>
          </Panel>
        </Block>

        {/* ═══════════════════════════════════════════════
            dashboard/components/ui.tsx
        ═══════════════════════════════════════════════ */}
        <Block title="B · dashboard/components/ui.tsx">
          <Panel>
            <Meta
              name="ViewHeader"
              path="app/(app)/dashboard/components/ui.tsx"
              used="Discovery, Cheer, Business, Collections, Admin 等"
            />
            <ViewHeader
              title="Gallery View"
              sub="開発用プレビュー"
              onBack={() => undefined}
              t={t}
              roleColor="#C8E800"
            />
          </Panel>

          <Panel>
            <Meta
              name="PulseIndicator / StatBlock / ViewLoader"
              path="app/(app)/dashboard/components/ui.tsx"
              used="Home 等"
            />
            <div className="flex flex-wrap items-end gap-8">
              <PulseIndicator days={3} />
              <PulseIndicator days={14} size="lg" />
              <StatBlock value={animValue} label="CHEERS" accent="#C8E800" />
              <StatBlock value="1.2k" label="STRING" />
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <ViewLoader t={t} />
            </div>
          </Panel>
        </Block>

        {/* ═══════════════════════════════════════════════
            auth
        ═══════════════════════════════════════════════ */}
        <Block title="C · components/auth/* + vc-auth-input">
          <Panel className="!p-0 overflow-hidden">
            <Meta
              name="AuthAmbientBg"
              path="components/auth/AuthAmbientBg.tsx"
              used="login / register / reset / thanks"
            />
            <div className="relative h-40 overflow-hidden rounded-xl border border-white/10">
              <AuthAmbientBg />
              <p className="relative z-10 p-4 text-xs text-white/50">背景デモ（相対コンテナ内）</p>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <Meta
                name="AuthPulseLoader"
                path="components/auth/AuthStatusMotion.tsx"
                used="register 送信中"
              />
              <div className="scale-90 origin-top">
                <AuthPulseLoader label="ギャラリー: 登録中デモ" />
              </div>
            </Panel>
            <Panel>
              <Meta
                name="AuthSuccessMark / AuthIconBadge"
                path="components/auth/AuthStatusMotion.tsx"
                used="register 完了 / thanks"
              />
              <div className="scale-90 origin-top space-y-6">
                <AuthSuccessMark title="完了デモ" subtitle="ブランド統一ステータス" />
                <div className="flex justify-center gap-4">
                  <AuthIconBadge kind="verify" />
                  <AuthIconBadge kind="verified" />
                </div>
              </div>
            </Panel>
          </div>

          <Panel>
            <Meta
              name="vc-auth-input (CSS)"
              path="app/globals.css · .vc-auth-input"
              used="login / register / reset-password"
            />
            <div className="max-w-sm space-y-2">
              <label className="text-xs text-white/40">通常</label>
              <input className="vc-auth-input" placeholder="you@example.com" defaultValue="" />
              <label className="text-xs text-white/40">フォーカスして確認</label>
              <input className="vc-auth-input" placeholder="password" type="password" />
              <input className="vc-auth-input" disabled placeholder="disabled" />
            </div>
          </Panel>
        </Block>

        {/* ═══════════════════════════════════════════════
            AdCard 重複比較
        ═══════════════════════════════════════════════ */}
        <Block title="D · AdCard 重複比較（2 実装）">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <Meta
                name="Global AdCard"
                path="components/AdCard.tsx"
                used="公開プロフィール, HubAdPanel, VoiceLab, voicelab page"
              />
              <div className="overflow-hidden rounded-xl border border-white/10">
                <GlobalAdCard ad={MOCK_AD} size="medium" />
              </div>
            </Panel>
            <Panel>
              <Meta
                name="News Rooms AdCard"
                path="app/(app)/news-rooms/components/AdCard.tsx"
                used="NewsRoomsContent（アプリ内ニュース）"
              />
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white text-black">
                <NewsAdCard
                  ad={{
                    id: "news-ad",
                    headline: "ギャラリー用モック広告 — News 実装",
                    link_url: "https://vizion-connection.jp",
                    sponsor: "Demo Sponsor",
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-white/35">
                ライト面 + [PR] バッジ。props 形状も Global と異なる。
              </p>
            </Panel>
          </div>
        </Block>

        {/* ═══════════════════════════════════════════════
            schedule
        ═══════════════════════════════════════════════ */}
        <Block title="E · components/schedule/*">
          <Panel>
            <Meta
              name="CalendarHeader"
              path="components/schedule/CalendarHeader.tsx"
              used="ScheduleClient"
            />
            <div className="rounded-xl border border-white/10 bg-[#0d0d14] p-2">
              <CalendarHeader
                date={calMonth}
                view={calView}
                onPrev={() =>
                  setCalMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                }
                onToday={() => setCalMonth(new Date())}
                onNext={() =>
                  setCalMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                }
                onChangeView={setCalView}
                onCreate={() => undefined}
                canEdit
              />
            </div>
          </Panel>

          <Panel>
            <Meta
              name="MiniCalendar"
              path="components/schedule/MiniCalendar.tsx"
              used="ScheduleClient / CalendarSidebar"
            />
            <div className="max-w-xs rounded-xl border border-white/10 bg-[#0d0d14] p-3">
              <MiniCalendar
                month={calMonth}
                selected={calSelected}
                onChangeMonth={setCalMonth}
                onSelectDate={setCalSelected}
              />
            </div>
          </Panel>
        </Block>

        {/* ═══════════════════════════════════════════════
            career wizard
        ═══════════════════════════════════════════════ */}
        <Block title="F · components/career-wizard/WizardUI.tsx">
          <Panel>
            <Meta
              name="StepHeader / Field / WizardInput / Textarea / Select"
              path="components/career-wizard/WizardUI.tsx"
              used="CareerWizard 各 step"
            />
            <div className="max-w-md">
              <StepHeader
                eyebrow="GALLERY"
                title="Wizard UI デモ"
                hint="zustand の roleColor を参照（未設定時はデフォルト色）"
              />
              <Field label="Display Name">
                <WizardInput
                  value={wizardText}
                  onChange={setWizardText}
                  placeholder="名前"
                  maxLength={40}
                />
              </Field>
              <Field label="Bio">
                <WizardTextarea
                  value={wizardArea}
                  onChange={setWizardArea}
                  maxLength={200}
                  rows={3}
                />
              </Field>
              <Field label="Select">
                <WizardSelect value={wizardSelect} onChange={setWizardSelect}>
                  <option value="a">Option A</option>
                  <option value="b">Option B</option>
                </WizardSelect>
              </Field>
            </div>
          </Panel>
        </Block>

        <footer className="mt-12 border-t border-white/10 pt-6 pb-16 text-center text-[11px] text-white/30">
          /dashboard/dev/components · 本番は Admin のみ · 開発環境はログイン済みでアクセス可
        </footer>
      </div>
    </div>
  );
}

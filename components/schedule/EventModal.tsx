"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Schedule, ScheduleCategory } from "@/types/schedule";
import { CATEGORY_CONFIG } from "@/types/schedule";

type DraftSchedule = {
  id?: string;
  title: string;
  start_at: string;
  end_at: string;
  location: string;
  site_url: string;
  description: string;
  category: ScheduleCategory;
  is_public: boolean;
};

export default function EventModal({
  open,
  selected,
  draft,
  canEdit,
  saving,
  errorMessage,
  accentColor,
  onClose,
  onSave,
  onRemove,
  onOpenEdit,
  setDraft,
}: {
  open: boolean;
  selected: Schedule | null;
  draft: DraftSchedule;
  canEdit: boolean;
  saving: boolean;
  errorMessage: string | null;
  accentColor: string;
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
  onOpenEdit: (s: Schedule) => void;
  setDraft: Dispatch<SetStateAction<DraftSchedule>>;
}) {
  const [confirm, setConfirm] = useState<null | "delete" | "make_public" | "make_private">(null);

  useEffect(() => {
    if (!open) setConfirm(null);
  }, [open]);

  const privacyChange = useMemo(() => {
    if (!selected) return null;
    if (Boolean(selected.is_public) === Boolean(draft.is_public)) return null;
    return draft.is_public ? "make_public" : "make_private";
  }, [draft.is_public, selected]);

  const confirmTitle = useMemo(() => {
    if (confirm === "delete") return "本当に削除しますか？";
    if (confirm === "make_public") return "この予定を公開しますか？";
    if (confirm === "make_private") return "この予定を非公開にしますか？";
    return "";
  }, [confirm]);

  const confirmDesc = useMemo(() => {
    if (confirm === "delete") return "この操作は取り消せません。";
    if (confirm === "make_public") return "公開にすると、公開プロフィール等で表示される可能性があります。";
    if (confirm === "make_private") return "非公開にすると、他のユーザーには表示されません。";
    return "";
  }, [confirm]);

  const handleClose = () => {
    setConfirm(null);
    onClose();
  };

  const requestSave = () => {
    if (!selected) {
      onSave();
      return;
    }
    if (privacyChange) {
      setConfirm(privacyChange);
      return;
    }
    onSave();
  };

  const requestRemove = () => {
    setConfirm("delete");
  };

  const runConfirmed = () => {
    if (confirm === "delete") {
      onRemove();
      return;
    }
    if (confirm === "make_public" || confirm === "make_private") {
      onSave();
      return;
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[90] border-none bg-black/70"
            aria-label="閉じる"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-0 z-[91] grid place-items-center p-4"
          >
            <div className="relative w-full max-w-[620px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-3xl border border-border bg-background p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="mb-1 font-mono text-[10px] font-black tracking-[0.18em] text-muted-foreground/60">SCHEDULE</p>
                  <h2 className="m-0 text-xl font-black text-foreground">{selected ? "予定詳細" : "予定を追加"}</h2>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-bold text-foreground/80 hover:bg-muted/30"
                >
                  閉じる
                </button>
              </div>

              {errorMessage ? (
                <div className="mb-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm font-bold leading-relaxed text-red-200">
                  {errorMessage}
                </div>
              ) : null}

              <AnimatePresence>
                {confirm ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[2] grid place-items-center"
                  >
                    <motion.button
                      type="button"
                      aria-label="confirm-backdrop"
                      onClick={() => setConfirm(null)}
                      disabled={saving}
                      className="absolute inset-0 border-none bg-black/45 backdrop-blur-[6px] disabled:opacity-100"
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: 8 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="relative z-[3] w-full max-w-[420px] rounded-2xl border border-border bg-background/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
                    >
                      <p className="m-0 text-sm font-black text-foreground">{confirmTitle}</p>
                      <p className="mb-0 mt-1 text-xs text-muted-foreground">{confirmDesc}</p>
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirm(null)}
                          disabled={saving}
                          className="rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-sm font-black text-foreground/80 disabled:opacity-60"
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          onClick={runConfirmed}
                          disabled={saving}
                          className="rounded-xl px-4 py-2.5 text-sm font-black text-background disabled:opacity-60"
                          style={{ background: accentColor, border: `1px solid ${accentColor}40` }}
                        >
                          実行する
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {selected && !canEdit ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                      style={{
                        background: `${CATEGORY_CONFIG[selected.category].color}18`,
                        border: `1px solid ${CATEGORY_CONFIG[selected.category].color}25`,
                        color: CATEGORY_CONFIG[selected.category].color,
                      }}
                    >
                      {CATEGORY_CONFIG[selected.category].label}
                    </span>

                    {!selected.is_public ? (
                      <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[11px] font-extrabold text-foreground/80">
                        非公開
                      </span>
                    ) : null}
                  </div>

                  <p className="m-0 text-lg font-black text-foreground">{selected.title}</p>
                  <p className="m-0 text-xs text-muted-foreground">
                    {new Date(selected.start_at).toLocaleString("ja-JP")}
                    {selected.end_at ? ` - ${new Date(selected.end_at).toLocaleString("ja-JP")}` : ""}
                  </p>

                  {selected.location ? <p className="m-0 text-xs text-muted-foreground">場所: {selected.location}</p> : null}

                  {selected.site_url ? (
                    <p className="m-0 text-xs text-muted-foreground">
                      リンク:{" "}
                      <a href={selected.site_url} target="_blank" rel="noopener noreferrer" className="text-foreground underline">
                        {selected.site_url}
                      </a>
                    </p>
                  ) : null}

                  {selected.description ? <p className="m-0 text-sm leading-relaxed text-foreground/80">{selected.description}</p> : null}

                  <div className="mt-1.5">
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => onOpenEdit(selected)}
                        className="rounded-xl px-3.5 py-2.5 text-sm font-black"
                        style={{
                          border: `1px solid ${accentColor}40`,
                          background: `${accentColor}18`,
                          color: accentColor,
                        }}
                      >
                        編集する
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {!selected ? null : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                        style={{
                          background: `${CATEGORY_CONFIG[selected.category].color}18`,
                          border: `1px solid ${CATEGORY_CONFIG[selected.category].color}25`,
                          color: CATEGORY_CONFIG[selected.category].color,
                        }}
                      >
                        {CATEGORY_CONFIG[selected.category].label}
                      </span>

                      {!selected.is_public ? (
                        <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[11px] font-extrabold text-foreground/80">
                          非公開
                        </span>
                      ) : null}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2.5">
                    <label className="grid gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground/70">タイトル</span>
                      <input
                        value={draft.title}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        className="h-11 rounded-xl border border-border bg-muted/10 px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="grid gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground/70">開始日時</span>
                        <input
                          type="datetime-local"
                          value={draft.start_at}
                          onChange={(e) => setDraft((d) => ({ ...d, start_at: e.target.value }))}
                          className="h-11 rounded-xl border border-border bg-muted/10 px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </label>

                      <label className="grid gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground/70">終了日時</span>
                        <input
                          type="datetime-local"
                          value={draft.end_at}
                          onChange={(e) => setDraft((d) => ({ ...d, end_at: e.target.value }))}
                          className="h-11 rounded-xl border border-border bg-muted/10 px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </label>
                    </div>

                    <label className="grid gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground/70">場所</span>
                      <input
                        value={draft.location}
                        onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                        className="h-11 rounded-xl border border-border bg-muted/10 px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground/70">サイトリンク</span>
                      <input
                        value={draft.site_url}
                        onChange={(e) => setDraft((d) => ({ ...d, site_url: e.target.value }))}
                        placeholder="https://..."
                        className="h-11 rounded-xl border border-border bg-muted/10 px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground/70">説明</span>
                      <textarea
                        value={draft.description}
                        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                        rows={4}
                        className="min-h-[96px] rounded-xl border border-border bg-muted/10 px-3 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="grid gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground/70">カテゴリ</span>
                        <select
                          value={draft.category}
                          onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as ScheduleCategory }))}
                          className="h-11 rounded-xl border border-border bg-muted/10 px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="mt-6 flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={draft.is_public}
                          onChange={(e) => setDraft((d) => ({ ...d, is_public: e.target.checked }))}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-foreground/80">公開する</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex gap-2">
                      {selected ? (
                        <button
                          type="button"
                          onClick={requestRemove}
                          disabled={saving}
                          className="rounded-xl border border-red-500/35 bg-red-500/10 px-3.5 py-2.5 text-sm font-black text-red-200 disabled:opacity-60"
                        >
                          削除
                        </button>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={requestSave}
                      disabled={saving}
                      className="rounded-xl px-4 py-2.5 text-sm font-black text-background disabled:opacity-60"
                      style={{ background: accentColor, border: `1px solid ${accentColor}40` }}
                    >
                      保存
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

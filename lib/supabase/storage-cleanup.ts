// lib/supabase/storage-cleanup.ts
// Storage 上の孤立ファイル（置き換えで参照されなくなった旧アセット）を削除するユーティリティ。
//
// 単一スロット画像（avatar / profile(hero)）は再アップロードで新ファイルが作られ、旧ファイルが
// 孤立する。本モジュールは「DB が新URLへ更新された後」に、参照されなくなった旧アセットを
// **単一パス指定**で削除する責務を持つ（prefix 走査による探索削除は行わない）。
//
// 【重要 / 本番削除フェーズ（PHASE A-8.6 で有効化済み）】
// 既定で実削除を行う。dry-run へ戻す（キルスイッチ）場合のみ環境変数
// STORAGE_CLEANUP_DRY_RUN="true" を設定する。未設定・"true" 以外は実削除（本番モード）。
// （banner は固定パス＋upsert で孤立しないため対象外。Journey 等「投稿ごとに別ファイル」を
//  持つ画像の purge は単一スロット前提が成立しないため本モジュールの対象外＝将来課題 P2。）

import { supabaseServer } from "@/lib/supabase/server";

/**
 * dry-run フラグ。true の間は実削除を行わず、削除候補をログ出力するのみ。
 *
 * 環境変数 STORAGE_CLEANUP_DRY_RUN で制御する（PHASE A-8.6 で本番削除を有効化）：
 * - 未設定（既定）→ false（実削除を実行・本番モード）
 * - "true"（明示）→ true（dry-run へ戻すキルスイッチ）
 * - 上記以外の値 → false（実削除）
 */
export const STORAGE_CLEANUP_DRY_RUN = process.env.STORAGE_CLEANUP_DRY_RUN === "true";

export interface CleanupObjectParams {
    /** 対象バケット名（例: "profiles"） */
    bucket: string;
    /** 削除対象オブジェクトのバケット内パス（単一候補のみ） */
    path: string;
}

export interface CleanupResult {
    /** 削除対象だったパス */
    path: string;
    /** 実削除を行ったか（dry-run の間は常に false） */
    deleted: boolean;
}

/**
 * Supabase Storage の公開URLから、指定バケット内のオブジェクトパスを抽出する。
 * 当該バケットの管理URL（/storage/v1/object/public/{bucket}/ を含む）でない場合は null。
 * 外部URL等を誤って削除対象にしないためのガード。
 */
export function storageObjectPathFromPublicUrl(publicUrl: string, bucket: string): string | null {
    if (!publicUrl) return null;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    const raw = publicUrl.slice(idx + marker.length).split("?")[0];
    if (!raw) return null;
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

/**
 * 指定した単一オブジェクトを削除する。
 * dry-run（既定）の間はログ出力のみで、Storage には一切変更を加えない。
 *
 * best-effort: remove 失敗は呼び出し側の処理を止めないよう内部で握りつぶし、ログを残す。
 * 探索（list）は行わず、与えられた path のみを対象にする。
 */
export async function cleanupOrphanedStorageObjects({ bucket, path }: CleanupObjectParams): Promise<CleanupResult> {
    if (!path) return { path, deleted: false };

    if (STORAGE_CLEANUP_DRY_RUN) {
        console.info("[storage-cleanup] dry-run — would delete orphaned object", { bucket, path });
        return { path, deleted: false };
    }

    // 実削除フェーズ（本番モード。dry-run へ戻すには STORAGE_CLEANUP_DRY_RUN="true"）。
    const { error } = await supabaseServer.storage.from(bucket).remove([path]);
    if (error) {
        console.error("[storage-cleanup] remove failed", { bucket, path, error: error.message });
        return { path, deleted: false };
    }
    console.info("[storage-cleanup] removed orphaned object", { bucket, path });
    return { path, deleted: true };
}

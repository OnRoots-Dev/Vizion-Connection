"use client";

// features/media/use-crop-upload.ts
// crop 後〜upload 完了までの共通処理を担う hook（media 処理責務）。
// UI 責務（modal 開閉 / cropSrc state / aspect / preview）は呼び出し側 component が保持する。
// Avatar / Banner / Profile(hero) で共通利用し、将来の Journey / Portfolio / Event 画像にも再利用可能。

import { useCallback, useState } from "react";
import { uploadImageToSupabase } from "@/lib/supabase/upload-image";
import { validateImageFile, blobToUploadFile } from "@/features/media";

export interface UseCropUploadOptions {
    uploadType: "avatar" | "banner" | "profile";
    /** 保存ファイルのベース名（拡張子は blob.type 基準で付与） */
    baseName: string;
    /** 入力ファイルの上限バイト数 */
    maxBytes: number;
    /** アップロード成功時に URL を受け取るコールバック（URL 反映 + cropSrc クリアは呼び出し側） */
    onUploaded: (url: string) => void;
}

export interface UseCropUploadResult {
    uploading: boolean;
    error: string;
    setError: (msg: string) => void;
    /** 入力ファイル検証。NG なら error を立て false を返す */
    validateFile: (file: File) => boolean;
    /** crop 済 Blob を File 化してアップロードし、成功時 onUploaded を呼ぶ */
    upload: (blob: Blob) => Promise<void>;
}

export function useCropUpload({ uploadType, baseName, maxBytes, onUploaded }: UseCropUploadOptions): UseCropUploadResult {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const validateFile = useCallback(
        (file: File): boolean => {
            const result = validateImageFile(file, { maxBytes });
            if (!result.ok) {
                setError(result.error ?? "画像ファイルを選択してください");
                return false;
            }
            setError("");
            return true;
        },
        [maxBytes],
    );

    const upload = useCallback(
        async (blob: Blob): Promise<void> => {
            setUploading(true);
            setError("");
            try {
                const url = await uploadImageToSupabase(blobToUploadFile(blob, baseName), uploadType);
                onUploaded(url);
            } catch (e) {
                setError(e instanceof Error ? e.message : "画像アップロードに失敗しました");
            } finally {
                setUploading(false);
            }
        },
        [baseName, uploadType, onUploaded],
    );

    return { uploading, error, setError, validateFile, upload };
}

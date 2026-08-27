// hooks/useWizardAutoSave.ts
// CareerWizardのデータ変更をdebounceして自動保存する。
// CareerWizardModal内でのみ使用。

"use client";

import { useEffect, useRef } from "react";
import { useCareerWizard } from "./useCareerWizard";

const DEBOUNCE_MS = 1500;

export function useWizardAutoSave() {
  const saveProfileToApi = useCareerWizard((s) => s.saveProfileToApi);
  const saveCareerToApi = useCareerWizard((s) => s.saveCareerToApi);
  const data = useCareerWizard((s) => s.data);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // 初回マウント時はスキップ（既存データで初期化済み）
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      await saveProfileToApi();
      await saveCareerToApi();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // data全体を監視（setFieldのたびに再発火）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
}

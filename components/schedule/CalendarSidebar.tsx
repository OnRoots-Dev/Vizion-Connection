"use client";

import { useEffect, useMemo, useState } from "react";
import MiniCalendar from "@/components/schedule/MiniCalendar";
import { Button } from "@/components/ui/button";

export default function CalendarSidebar({
  selectedDate,
  onSelectDate,
  onCreate,
  canEdit,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onCreate: () => void;
  canEdit: boolean;
}) {
  const [month, setMonth] = useState<Date>(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const selectedMonthKey = useMemo(() => `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`, [selectedDate]);

  useEffect(() => {
    setMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedMonthKey, selectedDate]);

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col gap-3 md:flex">
      {canEdit ? (
        <Button type="button" onClick={onCreate} className="w-full justify-center">
          ＋ 予定を追加
        </Button>
      ) : null}

      <MiniCalendar
        month={month}
        selected={selectedDate}
        onChangeMonth={(next) => setMonth(next)}
        onSelectDate={onSelectDate}
      />

      <div className="rounded-2xl border border-border bg-card/60 p-3 text-sm text-muted-foreground">
        マイカレンダー（準備中）
      </div>
    </aside>
  );
}

// lib/pulse-stats.ts
// Pulseに関するすべての算出ロジックの単一真実源

import { getJstDateKey } from './day-count'

export type PulseStats = {
  currentStreak: number      // 連続日数
  longestStreak: number      // 最長連続日数
  totalJourneys: number      // 総Journey数
  weeklyCount: number        // 今週の記録数(n/7)
  activityDays: Set<string>  // 記録済み日付Set
  status: 'day0' | 'active' | 'stalled' | 'revived'
}

export type PulseScore = {
  score: number        // 複合スコア
  streak: number       // 継続日数
  cheerCount: number   // 受け取ったCheer数
  bondCount: number    // Bond数
}

// streak算出（単一実装）
export function computeStreak(journeyDates: string[]): number {
  if (!journeyDates.length) return 0
  const days = new Set(journeyDates.map(d => getJstDateKey(new Date(d))))
  const today = getJstDateKey(new Date())
  const yesterday = getJstDateKey(new Date(Date.now() - 86400000))

  const anchor: string | null = days.has(today) ? today : days.has(yesterday) ? yesterday : null
  if (!anchor) return 0

  let count = 0
  let current = anchor
  while (days.has(current)) {
    count++
    const d = new Date(`${current}T00:00:00+09:00`)
    d.setDate(d.getDate() - 1)
    current = getJstDateKey(d)
  }
  return count
}

// 最長streak算出
export function computeLongestStreak(journeyDates: string[]): number {
  if (!journeyDates.length) return 0
  const days = [...new Set(journeyDates.map(d => getJstDateKey(new Date(d))))].sort()
  let longest = 1, current = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(`${days[i - 1]}T00:00:00+09:00`)
    const curr = new Date(`${days[i]}T00:00:00+09:00`)
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diff === 1) { current++; longest = Math.max(longest, current) }
    else current = 1
  }
  return longest
}

// 全stats算出
export function computePulseStats(
  journeyDates: string[],
): PulseStats {
  const streak = computeStreak(journeyDates)
  const longestStreak = computeLongestStreak(journeyDates)
  const activityDays = new Set(journeyDates.map(d => getJstDateKey(new Date(d))))
  const today = getJstDateKey(new Date())
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 6)
  const weeklyCount = journeyDates.filter(d => new Date(d) >= weekStart).length

  let status: PulseStats['status'] = 'day0'
  if (journeyDates.length === 0) status = 'day0'
  else if (streak > 0 && activityDays.has(today)) status = 'active'
  else if (streak === 0) status = 'stalled'
  else status = 'revived'

  return {
    currentStreak: streak,
    longestStreak,
    totalJourneys: journeyDates.length,
    weeklyCount,
    activityDays,
    status,
  }
}

// Pulse複合スコア算出
// score = streak × 1.0 + cheerCount × 0.5 + bondCount × 2.0
export function computePulseScore(
  streak: number,
  cheerCount: number,
  bondCount: number
): number {
  return Math.round(streak * 1.0 + cheerCount * 0.5 + bondCount * 2.0)
}

'use client'

import { motion } from 'motion/react'
import { Dumbbell, HeartHandshake, Briefcase, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Role = {
  id: string
  labelJa: string
  labelEn: string
  icon: LucideIcon
  color: string
  x: number
  y: number
}

// viewBox is 0 0 520 440, center hub at (260, 220)
const CENTER = { x: 260, y: 220 }

const ROLES: Role[] = [
  { id: 'athlete', labelJa: 'アスリート', labelEn: 'Athlete', icon: Zap, color: 'var(--role-athlete)', x: 110, y: 90 },
  { id: 'trainer', labelJa: 'トレーナー', labelEn: 'Trainer', icon: Dumbbell, color: 'var(--role-trainer)', x: 410, y: 90 },
  { id: 'fan', labelJa: 'ファン', labelEn: 'Fan', icon: HeartHandshake, color: 'var(--role-fan)', x: 110, y: 350 },
  { id: 'business', labelJa: 'ビジネス', labelEn: 'Business', icon: Briefcase, color: 'var(--role-business)', x: 410, y: 350 },
]

// relationships between roles with a short Japanese meaning
const EDGES: { a: number; b: number; label: string }[] = [
  { a: 0, b: 1, label: '指導 × データ' },
  { a: 0, b: 2, label: '応援 × 発信' },
  { a: 1, b: 3, label: '実績 × 案件' },
  { a: 2, b: 3, label: '熱量 × ブランド' },
]

export function NetworkMap() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="vz-grid absolute inset-0 rounded-3xl" aria-hidden="true" />
      <svg
        viewBox="0 0 520 440"
        className="relative w-full"
        role="img"
        aria-label="アスリート・トレーナー・ファン・ビジネスが相乗効果でつながる関係図"
      >
        <defs>
          <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--lime)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* spokes: each role -> center hub */}
        {ROLES.map((role, i) => (
          <line
            key={`spoke-${role.id}`}
            x1={role.x}
            y1={role.y}
            x2={CENTER.x}
            y2={CENTER.y}
            stroke="var(--lime)"
            strokeWidth={1.4}
            strokeOpacity={0.5}
            style={{ animation: `vz-pulse-line ${3 + i * 0.4}s ease-in-out ${i * 0.25}s infinite` }}
          />
        ))}

        {/* perimeter relationship lines with labels */}
        {EDGES.map((edge, i) => {
          const from = ROLES[edge.a]
          const to = ROLES[edge.b]
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2
          // ファン↔トレーナー (2↔1) と アスリート↔ビジネス (0↔3) を点滅させる
          const shouldBlink = (edge.a === 2 && edge.b === 1) || (edge.a === 1 && edge.b === 2) ||
                             (edge.a === 0 && edge.b === 3) || (edge.a === 3 && edge.b === 0)
          return (
            <g key={`edge-${i}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="2 5"
              />
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={shouldBlink ? "var(--lime)" : "url(#flow)"}
                strokeWidth={2.2}
                strokeDasharray="6 34"
                style={{ animation: shouldBlink ? `vz-pulse-line 2s ease-in-out infinite` : `vz-dash-flow ${2.6 + i * 0.3}s linear infinite` }}
              />
              {/* relationship label chip */}
              <g transform={`translate(${mx}, ${my})`}>
                <rect
                  x={-42}
                  y={-9}
                  width={84}
                  height={18}
                  rx={9}
                  fill="color-mix(in oklch, var(--background) 90%, transparent)"
                  stroke="var(--border)"
                  strokeWidth={0.75}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: 9.5 }}
                >
                  {edge.label}
                </text>
              </g>
            </g>
          )
        })}

        {/* center synergy hub */}
        <circle cx={CENTER.x} cy={CENTER.y} r={70} fill="url(#hubGlow)" />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={44}
          fill="none"
          stroke="var(--lime)"
          strokeWidth={1.5}
          strokeOpacity={0.6}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: 'vz-ring-expand 3.2s ease-out infinite',
          }}
        />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={38}
          fill="color-mix(in oklch, var(--background) 82%, transparent)"
          stroke="var(--lime)"
          strokeWidth={2}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: 'vz-node-breathe 2.6s ease-in-out infinite',
          }}
        />
        <text
          x={CENTER.x}
          y={CENTER.y - 2}
          textAnchor="middle"
          className="fill-lime font-semibold"
          style={{ fontSize: 13 }}
        >
          相乗効果
        </text>
        <text
          x={CENTER.x}
          y={CENTER.y + 13}
          textAnchor="middle"
          className="fill-muted-foreground font-mono"
          style={{ fontSize: 8, letterSpacing: 1 }}
        >
          SYNERGY
        </text>
        {/* 支援 × 露出 - 相乗効果の下に移動 */}
        <g transform={`translate(${CENTER.x}, ${CENTER.y + 45})`}>
          <rect
            x={-42}
            y={-9}
            width={84}
            height={18}
            rx={9}
            fill="color-mix(in oklch, var(--background) 90%, transparent)"
            stroke="var(--lime)"
            strokeWidth={0.75}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            className="fill-lime font-semibold"
            style={{ fontSize: 9.5 }}
          >
            支援 × 露出
          </text>
        </g>

        {/* role nodes */}
        {ROLES.map((role, i) => {
          const Icon = role.icon
          return (
            <g key={role.id}>
              <motion.circle
                cx={role.x}
                cy={role.y}
                r={34}
                fill="color-mix(in oklch, var(--background) 80%, transparent)"
                stroke={role.color}
                strokeWidth={2.5}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i, type: 'spring', stiffness: 180, damping: 14 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <foreignObject x={role.x - 16} y={role.y - 22} width={32} height={22}>
                <div className="flex h-full w-full items-center justify-center">
                  <Icon className="h-5 w-5" style={{ color: role.color }} strokeWidth={2} />
                </div>
              </foreignObject>
              <text
                x={role.x}
                y={role.y + 12}
                textAnchor="middle"
                className="fill-foreground font-semibold"
                style={{ fontSize: 11 }}
              >
                {role.labelJa}
              </text>
            </g>
          )
        })}
      </svg>

      {/* legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {ROLES.map((role) => (
          <div key={role.id} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: role.color }} />
            <span className="text-xs text-muted-foreground">{role.labelJa}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-lime" />
          <span className="text-xs text-muted-foreground">相乗効果ハブ</span>
        </div>
      </div>
    </div>
  )
}

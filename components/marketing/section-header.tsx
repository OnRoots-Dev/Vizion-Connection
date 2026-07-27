'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  id?: string
  kicker: string
  title: ReactNode
  lead?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeader({
  id,
  kicker,
  title,
  lead,
  align = 'center',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center'

  return (
    <motion.header
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'lp-section-head',
        centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl text-left',
        className,
      )}
    >
      <p className="lp-kicker">{kicker}</p>
      <h2 className="lp-title">{title}</h2>
      {lead ? <p className="lp-lead">{lead}</p> : null}
    </motion.header>
  )
}

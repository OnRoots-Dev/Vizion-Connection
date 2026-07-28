'use client'

import { useEffect, useRef } from 'react'

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  z: number // depth 0..1 (0 = far, 1 = near)
  r: number
}

const ROLE_COLORS = [
  [255, 80, 80],   // athlete red
  [48, 222, 29],   // trainer green
  [255, 200, 30],  // crew/fan amber
  [60, 140, 255],  // business blue
]

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let nodes: Node[] = []
    let raf = 0

    const build = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(28, Math.min(70, Math.floor((width * height) / 24000)))
      nodes = Array.from({ length: count }, () => {
        const z = Math.random()
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (0.12 + z * 0.22),
          vy: (Math.random() - 0.5) * (0.12 + z * 0.22),
          z,
          r: 0.8 + z * 2.4,
        }
      })
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)

      // parallax offset from pointer, scaled by depth
      const px = (pointer.current.x - 0.5) * 40
      const py = (pointer.current.y - 0.5) * 40

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < -20) n.x = width + 20
        if (n.x > width + 20) n.x = -20
        if (n.y < -20) n.y = height + 20
        if (n.y > height + 20) n.y = -20
      }

      // connections
      const maxDist = Math.min(width, height) * 0.22
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        const ax = a.x + px * a.z
        const ay = a.y + py * a.z
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const bx = b.x + px * b.z
          const by = b.y + py * b.z
          const dx = ax - bx
          const dy = ay - by
          const dist = Math.hypot(dx, dy)
          if (dist < maxDist) {
            const depth = (a.z + b.z) / 2
            const closeness = 1 - dist / maxDist
            const pulse = 0.5 + 0.5 * Math.sin(t * 0.0016 + (i + j) * 0.5)
            const alpha = closeness * (0.05 + depth * 0.16) * (0.6 + 0.4 * pulse)
            ctx.strokeStyle = `rgba(200, 232, 0, ${alpha})`
            ctx.lineWidth = 0.4 + depth * 0.9
            ctx.beginPath()
            ctx.moveTo(ax, ay)
            ctx.lineTo(bx, by)
            ctx.stroke()
          }
        }
      }

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const x = n.x + px * n.z
        const y = n.y + py * n.z
        const color = ROLE_COLORS[i % ROLE_COLORS.length]
        const twinkle = 0.6 + 0.4 * Math.sin(t * 0.002 + i)
        const alpha = (0.25 + n.z * 0.5) * twinkle
        ctx.beginPath()
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`
        ctx.arc(x, y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    build()
    if (prefersReduced) {
      draw(0)
    } else {
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => build()
    const onPointer = (e: PointerEvent) => {
      pointer.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointer)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--lime)_14%,transparent),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

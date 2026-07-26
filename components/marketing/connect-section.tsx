'use client'

import { motion } from 'motion/react'

const STEPS = [
  {
    step: '01',
    title: 'マップに参加',
    body: '自分のロールを選ぶ。あなたのノードがライブマップに現れ、つながる準備が整う。',
  },
  {
    step: '02',
    title: 'リンクが形成される',
    body: '近くのロールや共通の興味がつながりを生む。あなたの間に線が点灯する。',
  },
  {
    step: '03',
    title: 'シグナルが流れる',
    body: 'すべてのリンクで活動が脈動する — トレーニング、応援、取引、ストーリーがリアルタイムで動く。',
  },
  {
    step: '04',
    title: 'ネットワークが成長する',
    body: '各つながりが次のつながりをより価値あるものにする。勢いは外側へと広がっていく。',
  },
]

export function ConnectSection() {
  return (
    <section id="network" className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-lime">つながり方</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          ひつのノードから、生きたネットワークへ
        </h2>
      </div>

      <div className="relative mt-16">
        {/* connecting line */}
        <div
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent lg:block"
          aria-hidden="true"
        />
        <ol className="grid gap-8 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-lime/40 bg-background font-mono text-sm text-lime">
                {s.step}
                <span
                  className="absolute inset-0 rounded-full border border-lime/30"
                  style={{ animation: `vz-ring-expand 3s ease-out ${i * 0.5}s infinite` }}
                />
              </div>
              <h3 className="mt-5 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

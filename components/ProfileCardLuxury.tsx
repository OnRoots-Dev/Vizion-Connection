'use client'

import { Canvas, useThree } from '@react-three/fiber'
import {
  Environment,
  ContactShadows,
  useTexture,
  RoundedBox,
  Html,
} from '@react-three/drei'
import { Suspense, useState } from 'react'
import * as THREE from 'three'

type Role = 'athlete' | 'trainer' | 'fan' | 'business'

interface Props {
  role: Role
  name: string
  region: string
  title?: string
  avatarUrl: string
  cardId?: string
  memberSince?: string
  specialTag?: string
}

const roleConfig = {
  athlete: { label: 'ATHLETE', logo: '⚡' },
  trainer: { label: 'TRAINER', logo: '◎' },
  fan: { label: 'SUPPORTER', logo: '♡' },
  business: { label: 'BUSINESS', logo: '◆' },
}

function LuxuryCard({
  role,
  name,
  region,
  title,
  avatarUrl,
  cardId = 'VC-0000',
  memberSince = '2026',
  specialTag,
  flipped,
}: Props & { flipped: boolean }) {
  const texture = useTexture(avatarUrl)
  const config = roleConfig[role]

  const width = 3.2
  const height = 2.0
  const depth = 0.05

  return (
    <group rotation-y={flipped ? Math.PI : 0}>
      {/* カード本体 */}
      <RoundedBox args={[width, height, depth]} radius={0.07} smoothness={4}>
        <meshPhysicalMaterial
          color="#141414"
          metalness={0.4}
          roughness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* ===== 表面 ===== */}
      <group position={[0, 0, depth / 2 + 0.002]}>
        {/* 上部ブランド + タグ */}
        <Html
          position={[-1.35, 0.78, 0]}
          transform
          occlude
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-[#C8E800] text-[11px] font-bold tracking-widest whitespace-nowrap">
            VIZION CONNECTION
          </div>
        </Html>

        {specialTag && (
          <Html
            position={[1.35, 0.78, 0]}
            transform
            occlude
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-[#C8E800] text-[10px] font-bold tracking-wider whitespace-nowrap">
              {specialTag}
            </div>
          </Html>
        )}

        {/* 中央ロゴ */}
        <Html
          position={[0, 0.25, 0]}
          center
          transform
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-[#C8E800] text-6xl opacity-20 select-none">
            {config.logo}
          </div>
        </Html>

        {/* アバター */}
        <mesh position={[-1.0, -0.1, 0.01]}>
          <circleGeometry args={[0.36, 64]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        <mesh position={[-1.0, -0.1, 0.005]}>
          <ringGeometry args={[0.365, 0.40, 64]} />
          <meshBasicMaterial color="#C8E800" transparent opacity={0.55} />
        </mesh>

        {/* 名前・情報 */}
        <Html
          position={[-0.45, -0.05, 0]}
          transform
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-white text-[15px] font-semibold whitespace-nowrap">
            {name}
          </div>
        </Html>

        {title && (
          <Html
            position={[-0.45, -0.28, 0]}
            transform
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-zinc-400 text-[12px] whitespace-nowrap">
              {title}
            </div>
          </Html>
        )}

        <Html
          position={[-0.45, -0.48, 0]}
          transform
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-[#C8E800] text-[11px] whitespace-nowrap">
            {region}
          </div>
        </Html>

        <Html
          position={[1.3, -0.75, 0]}
          transform
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-zinc-500 text-[10px] font-mono whitespace-nowrap">
            {cardId} · SINCE {memberSince}
          </div>
        </Html>
      </group>

      {/* ===== 裏面 ===== */}
      <group position={[0, 0, -depth / 2 - 0.002]} rotation-y={Math.PI}>
        <mesh>
          <planeGeometry args={[width - 0.1, height - 0.1]} />
          <meshPhysicalMaterial
            color="#0f0f0f"
            metalness={0.3}
            roughness={0.3}
            clearcoat={0.8}
          />
        </mesh>

        {/* 重要: Htmlを再度反転させて文字を正常に戻す */}
        <Html
          center
          transform
          position={[0, 0, 0.01]}
          style={{
            pointerEvents: 'none',
            transform: 'scaleX(-1)'  // ← これがポイント
          }}
        >
          <div className="text-center space-y-3 w-64">
            <div className="text-[#C8E800] text-sm font-bold tracking-widest">
              DIGITAL IDENTITY
            </div>
            <div className="text-zinc-400 text-xs leading-relaxed">
              This card represents your presence
              <br />
              in the Vizion Connection ecosystem.
            </div>
            <div className="text-zinc-500 text-xs space-y-1">
              <div>Role: {config.label}</div>
              <div>Region: {region}</div>
            </div>
            <div className="text-zinc-600 text-[10px] tracking-wider pt-2">
              SCAN TO VERIFY · VIZION CONNECTION
            </div>
          </div>
        </Html>
      </group>
    </group>
  )
}

function CardScene(props: Props & { flipped: boolean }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 5]} intensity={1.4} />
      <directionalLight position={[-3, 2, 3]} intensity={0.45} color="#C8E800" />
      <spotLight position={[0, 5, 3]} intensity={0.6} angle={0.5} penumbra={1} />

      <Suspense fallback={null}>
        <LuxuryCard {...props} />
      </Suspense>

      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.45}
        scale={7}
        blur={2.5}
        far={4}
      />
      <Environment preset="city" environmentIntensity={0.85} />
    </>
  )
}

export function ProfileCardLuxury(props: Props) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="relative w-[400px] h-[260px] select-none">
      <div
        className="absolute inset-0 cursor-pointer rounded-xl overflow-hidden"
        onClick={() => setFlipped((v) => !v)}
      >
        <Canvas
          camera={{ position: [0, 0, 5.8], fov: 38 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          style={{ background: 'transparent' }}
        >
          <CardScene {...props} flipped={flipped} />
        </Canvas>
      </div>

      <div className="absolute -bottom-7 left-0 right-0 text-center">
        <span className="text-[10px] text-zinc-600 tracking-widest uppercase">
          Click to flip
        </span>
      </div>
    </div>
  )
}
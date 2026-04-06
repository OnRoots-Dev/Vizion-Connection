import React, { useEffect, useState, useMemo } from 'react';

// ─────────────────────────────────────────────
// エリア定義
// ─────────────────────────────────────────────
const REGION_DATA: Record<string, { label: string; color: string; roots: number; plus: number; prefs: number[] }> = {
  hokkaidoTohoku: { label: "北海道・東北", color: "#38BDF8", roots: 20, plus: 10, prefs: [1, 2, 3, 4, 5, 6, 7] },
  kanto: { label: "関東", color: "#34D399", roots: 20, plus: 10, prefs: [8, 9, 10, 11, 12, 13, 14] },
  chubu: { label: "中部", color: "#A78BFA", roots: 20, plus: 10, prefs: [15, 16, 17, 18, 19, 20, 21, 22, 23] },
  kinki: { label: "近畿", color: "#FBBF24", roots: 20, plus: 10, prefs: [24, 25, 26, 27, 28, 29, 30] },
  chugokuShikoku: { label: "中国・四国", color: "#F472B6", roots: 20, plus: 10, prefs: [31, 32, 33, 34, 35, 36, 37, 38, 39] },
  kyushuOkinawa: { label: "九州・沖縄", color: "#FB923C", roots: 20, plus: 10, prefs: [40, 41, 42, 43, 44, 45, 46, 47] },
};

// ─────────────────────────────────────────────
// プロジェクション
// ─────────────────────────────────────────────
const LAT_SCALE = 1.4;
function project(lng: number, lat: number): [number, number] {
  return [lng, -(lat * LAT_SCALE)];
}

function buildPath(geometry: any, proj = project): string {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys.map((poly: any) =>
    poly.map((ring: any) =>
      'M' + ring.map((p: any) => proj(p[0], p[1]).join(',')).join('L') + 'Z'
    ).join(' ')
  ).join(' ');
}

function calcBounds(features: any[], proj = project, skipPrefs: number[] = []) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  features.forEach((f: any) => {
    if (skipPrefs.includes(f.properties.pref)) return;
    const rings = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    rings.forEach((poly: any) => poly.forEach((ring: any) => ring.forEach((p: any) => {
      const [x, y] = proj(p[0], p[1]);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    })));
  });
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

// ─────────────────────────────────────────────
// レスポンシブ hook
// ─────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const JapanMap: React.FC = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const mapAreaRef = React.useRef<HTMLDivElement>(null);
  const windowWidth = useWindowWidth();

  // ブレークポイント
  const isSM = windowWidth < 480;   // スマホ縦
  const isMD = windowWidth < 768;   // タブレット未満
  const isLG = windowWidth >= 1024; // ラップトップ以上
  const isXL = windowWidth >= 1280; // デスクトップ大

  useEffect(() => {
    fetch('/data/prefectures.json')
      .then(r => r.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);

  // ── viewBox（地図の周りに余白を多めに確保）
  const mainVB = useMemo(() => {
    if (!geoData) return null;
    const b = calcBounds(geoData.features, project, []);
    // 余白：縦横それぞれ5%ずつ（元より大きめ）
    const padX = b.w * 0.05;
    const padY = b.h * 0.05;
    return `${b.minX - padX} ${b.minY - padY} ${b.w + padX * 2} ${b.h + padY * 2}`;
  }, [geoData]);

  const mainAspect = useMemo(() => {
    if (!geoData) return 1.55;
    const b = calcBounds(geoData.features, project, []);
    // 余白込みのアスペクト比
    const padX = b.w * 0.05;
    const padY = b.h * 0.05;
    return (b.h + padY * 2) / (b.w + padX * 2);
  }, [geoData]);

  const getRegion = (prefId: number) =>
    Object.values(REGION_DATA).find(r => r.prefs.includes(prefId));

  const pos = (e: React.MouseEvent) => {
    const r = mapAreaRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : null;
  };
  const onEnter = (e: React.MouseEvent, name: string) => {
    const p = pos(e); if (p) setTooltip({ name, ...p });
  };
  const onMove = (e: React.MouseEvent) => {
    const p = pos(e); if (p) setTooltip(prev => prev ? { ...prev, ...p } : null);
  };

  if (!geoData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07101F', color: '#64748B', fontFamily: 'sans-serif' }}>
        Loading…
      </div>
    );
  }

  const allFeatures = geoData.features;

  // ── 凡例レイアウト: sm→1列2行, md→3列2行, lg→6列1行
  const legendColumns = isSM ? 2 : isMD ? 3 : 6;

  // ── ヘッダー高さ推定: sm→60, other→72px
  // ── 凡例高さ推定: sm→auto だが概算で 130px / md→90px / lg→64px
  const legendH = isSM ? 130 : isMD ? 90 : 64;
  const headerH = isSM ? 60 : 72;
  const footerH = 28;
  const gapTotal = 14 * 3; // gap * 3 sections
  const containerPaddingY = isSM ? 12 : 22;
  const sectionPaddingX = isXL ? 80 : isLG ? 64 : isMD ? 20 : 40;
  const footerPaddingBottom = isSM ? 10 : 16;
  const paddingV = containerPaddingY + footerPaddingBottom;

  // mapArea の最大高さ = 100vh - その他の要素の高さ
  const mapMaxH = `calc(100vh - ${headerH + legendH + footerH + gapTotal + paddingV}px)`;

  // mapArea の幅に対する地図の最大幅（アスペクト比で制限）
  // mapArea 自体は width:100% なので、高さ上限から幅を逆算
  // → width を clamp で制限する形が最もシンプル
  const mapWidth = `min(100%, calc(${mapMaxH} / ${mainAspect.toFixed(4)}))`;

  return (
    <div style={{
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #07101F 0%, #0C1A2E 55%, #061320 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: `${containerPaddingY}px ${sectionPaddingX}px ${footerPaddingBottom}px`,
      fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
      color: '#E2E8F0',
      boxSizing: 'border-box',
    }}>

      {/* ── ヘッダー ── */}
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        borderBottom: '1px solid rgba(56,189,248,0.15)',
        paddingBottom: isSM ? 8 : 12,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: isSM ? 9 : 10, fontWeight: 700, letterSpacing: '0.22em', color: '#38BDF8', textTransform: 'uppercase' }}>
          SLOT MANAGEMENT SYSTEM
        </span>
        <h1 style={{ margin: 0, fontSize: isSM ? 16 : isMD ? 18 : 22, fontWeight: 700, letterSpacing: '-0.01em', color: '#F1F5F9' }}>
          エリア別スロット配置マップ
        </h1>
      </header>

      {/* ── マップカード ── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        background: 'rgba(10,18,38,0.7)',
        border: '1px solid rgba(56,189,248,0.11)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
      }}>

        {/* ── マップエリア：縦横どちらの上限にも引っかかるよう両方指定 ── */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isSM ? '8px' : '12px', // 地図周りの余白
          overflow: 'hidden',
        }}>
          <div
            ref={mapAreaRef}
            onMouseLeave={() => setTooltip(null)}
            style={{
              position: 'relative',
              width: mapWidth,
              // アスペクト比で高さを自動計算しつつ、最大高さも制限
              aspectRatio: `1 / ${mainAspect.toFixed(4)}`,
              maxHeight: mapMaxH,
              background: 'linear-gradient(150deg, #050C18 0%, #08132200 100%)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {/* グリッド */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `
                linear-gradient(rgba(56,189,248,0.028) 1px, transparent 1px),
                linear-gradient(90deg, rgba(56,189,248,0.028) 1px, transparent 1px)
              `,
              backgroundSize: '52px 52px',
              pointerEvents: 'none',
              zIndex: 1,
            }} />

            {/* SVG */}
            <svg
              viewBox={mainVB ?? undefined}
              preserveAspectRatio="xMidYMid meet"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <filter id="ds" x="-4%" y="-4%" width="108%" height="108%">
                  <feDropShadow dx="0.06" dy="0.12" stdDeviation="0.18"
                    floodColor="#000" floodOpacity="0.55" />
                </filter>
              </defs>
              <g filter="url(#ds)">
                {allFeatures.map((f: any, i: number) => {
                  const region = getRegion(f.properties.pref);
                  return (
                    <path
                      key={i}
                      d={buildPath(f.geometry)}
                      fill={region?.color ?? '#334155'}
                      stroke="#07101F"
                      strokeWidth="0.055"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => onEnter(e, f.properties.name)}
                      onMouseMove={onMove}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </g>
            </svg>

            {/* ツールチップ */}
            {tooltip && (
              <div style={{
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: 50,
                left: tooltip.x + 14,
                top: tooltip.y - 12,
                background: 'rgba(5,11,24,0.94)',
                border: '1px solid rgba(56,189,248,0.4)',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: '#F1F5F9',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                letterSpacing: '0.04em',
              }}>
                {tooltip.name}
              </div>
            )}
          </div>
        </div>

        {/* ── 凡例 ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${legendColumns}, 1fr)`,
          borderTop: '1px solid rgba(56,189,248,0.1)',
          background: 'rgba(5,11,24,0.8)',
          padding: isSM ? '10px 12px' : '13px 18px',
          gap: isSM ? '8px 0' : '6px 0',
          flexShrink: 0,
        }}>
          {Object.entries(REGION_DATA).map(([key, region]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
              padding: isSM ? '0 6px' : '0 12px',
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                marginTop: 3,
                flexShrink: 0,
                background: region.color,
                boxShadow: `0 0 6px ${region.color}88`,
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: isSM ? 9 : 10, fontWeight: 600, color: '#CBD5E1', whiteSpace: 'nowrap' }}>
                  {region.label}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: isSM ? 10 : 11, fontWeight: 700, color: '#F1F5F9' }}>
                    {region.roots}<small style={{ opacity: 0.5 }}> ROOT</small>
                  </span>
                  <span style={{ fontSize: isSM ? 10 : 11, fontWeight: 700, color: '#34D399' }}>
                    +{region.plus}<small style={{ opacity: 0.5 }}> PLUS</small>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── フッター ── */}
      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 2,
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: 4,
      }}>
        <span style={{ fontSize: 9, color: '#283650', letterSpacing: '0.08em' }}>
          ※ これはVIZION MAPではありません / Layout Verification Mode
        </span>
        <span style={{ fontSize: 9, color: '#283650', letterSpacing: '0.08em' }}>
          © Slot Management System
        </span>
      </footer>
    </div>
  );
};

export default JapanMap;

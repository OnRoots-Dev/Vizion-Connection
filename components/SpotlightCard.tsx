import React, { useMemo, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

const normalizeSpotlightColor = (color: string) => {
  const match = color.match(/rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\)/i);
  if (!match) return color;

  const [, r, g, b, a] = match;
  const adjustedAlpha = Math.max(0, Math.min(1, Number(a) * 0.95));
  return `rgba(${r}, ${g}, ${b}, ${adjustedAlpha.toFixed(2)})`;
};

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
  disabled?: boolean;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
  disabled = false
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (disabled || !divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const effectiveSpotlightColor = useMemo(() => normalizeSpotlightColor(spotlightColor), [spotlightColor]);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}
    >
      {!disabled && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
          style={{
            opacity,
            background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${effectiveSpotlightColor} 0%, rgba(255, 255, 255, 0.02) 35%, transparent 75%)`
          }}
        />
      )}
      {children}
    </div>
  );
};

export default SpotlightCard;

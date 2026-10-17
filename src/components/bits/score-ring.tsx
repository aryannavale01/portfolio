"use client";

import { useEffect, useRef, useState } from "react";

/** Circular progress ring: faint track, colored arc, centered value. */
export function ScoreRing({
  value,
  label,
  size = 120,
  color = "#E10600",
}: {
  value: number; // 0-100
  label: string;
  size?: number;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.disconnect()),
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        role="img"
        aria-label={`${label}: ${value} percent`}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={shown ? c - (c * pct) / 100 : c}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-2xl text-[#F5F5F5]">
          {value}
        </span>
      </div>
      <span className="mono-label text-white/50">{label}</span>
    </div>
  );
}

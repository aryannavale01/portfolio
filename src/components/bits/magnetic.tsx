"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

/** Magnetic hover wrapper (pro-lenis style). Disabled for reduced motion + touch. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  const move = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <span
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className="inline-block transition-transform duration-200 ease-out will-change-transform"
    >
      {children}
    </span>
  );
}

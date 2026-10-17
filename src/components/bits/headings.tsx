"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Section heading with a GSAP SplitText 3D char reveal (pro-lenis style). */
export function SplitHeading({
  children,
  className,
  style,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3";
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = new SplitText(el, { type: "chars", mask: "chars" });
    const tween = gsap.from(split.chars, {
      yPercent: 110,
      rotateX: -50,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.02,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn(
        "font-display text-3xl font-normal tracking-tight text-[#F5F5F5] md:text-5xl",
        className
      )}
      style={{ perspective: "600px", ...style }}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mono-label glass-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-white/60">
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent-red" />
      {children}
    </p>
  );
}

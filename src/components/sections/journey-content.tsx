"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Certifications } from "@/components/sections/certifications";
import { Contact } from "@/components/sections/contact";
import { ScrollCanvas, type ScrollCanvasConfig } from "@/components/hero/scroll-canvas";

gsap.registerPlugin(ScrollTrigger);

/**
 * Single continuous animated background spanning Skills → Projects → Certifications → Contact.
 * One ScrollCanvas, one ScrollTrigger covering the entire content block.
 */
export function JourneyContent() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<{ draw: (p: number) => void }>(null);

  const canvasConfig = useMemo<ScrollCanvasConfig>(() => ({
    sequence: "skills",
    frameRange: [1, 120],
    mobileFrameRange: [1, 60],
    desktopFx: 0.5,
    mobileFx: 0.5,
    fy: 0.5,
    scrub: 0.5,
    triggerId: "#journey-content",
  }), []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          canvasRef.current?.draw(self.progress);
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      id="journey-content"
      className="relative w-full"
    >
      {/* Single continuous sticky background canvas */}
      <div className="pointer-events-none sticky top-0 z-[-1] h-[100svh] -mb-[100svh] w-full overflow-hidden bg-[#050505]">
        <ScrollCanvas
          ref={canvasRef}
          config={canvasConfig}
        />
      </div>

      {/* Foreground content sections */}
      <div className="relative z-10 flex w-full flex-1 flex-col gap-16 pb-24 pt-16 md:gap-20">
        <Skills />
        <Projects />
        <Certifications />
        <Contact />
      </div>
    </div>
  );
}
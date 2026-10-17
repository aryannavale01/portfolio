"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reducedMotion, setReducedMotion] = useState<"never" | "user">("never");

  useEffect(() => {
    setReducedMotion("user");

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    // Pipe Lenis scroll into GSAP's ticker (recommended integration)
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Shared handle so nav anchors can smooth-scroll through Lenis.
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}

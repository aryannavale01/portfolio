"use client";

import { Expertise } from "@/components/sections/expertise";

/**
 * Expertise stage: full-width dark backdrop section that sits between
 * Hero/About and the Journey canvas. Provides a clean visual transition
 * with the same #050505 background as the canvas stages.
 */
export function ExpertiseStage() {
  return (
    <section
      id="expertise-stage"
      aria-labelledby="expertise-heading"
      className="relative w-full bg-[#050505] py-16 md:py-24"
    >
      {/* Top gradient blend from hero canvas */}
      <div
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {/* Bottom gradient blend into journey canvas */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Expertise />
      </div>
    </section>
  );
}
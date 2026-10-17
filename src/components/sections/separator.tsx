"use client";

import { motion } from "framer-motion";

/**
 * Dark separator section between Hero/About and Journey/Skills.
 * Provides a clean visual break between the two canvas animations.
 * Height is configurable via className (default 60vh).
 */
export function SectionSeparator({
  className = "h-[60vh]",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id="separator"
      aria-hidden="true"
      className={`relative w-full bg-[#050505] ${className}`}
    >
      {/* Subtle gradient vignette at top edge to blend from hero canvas */}
      <div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {/* Subtle gradient vignette at bottom edge to blend into journey canvas */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full max-w-6xl mx-auto items-center justify-center px-5 md:px-8">
        {children || (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <span className="mono-label text-white/40 tracking-widest uppercase">
              —  Work & Journey  —
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
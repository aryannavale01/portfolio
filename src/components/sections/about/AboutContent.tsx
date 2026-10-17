"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { about } from "@/data/about";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Shared stagger variant so the hero card and the section animate identically. */
export const aboutList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const aboutItem = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};

/** Copy block: heading, intro, stats-as-cards (section) or stats-as-badges
    (compact hero overlay), link. */
export function AboutContent({ variant = "cards" }: { variant?: "cards" | "badges" }) {
  return (
    <>
      <motion.h2
        variants={aboutItem}
        className="font-display text-3xl tracking-tight md:text-5xl"
      >
        <span className="text-[rgba(255,255,255,0.85)]">Hello, I&apos;m </span>
        <span className="text-white">Aryan.</span>
      </motion.h2>
      <motion.p
        variants={aboutItem}
        className="about-intro mt-3 max-w-[60ch] text-base leading-7 text-[rgba(255,255,255,0.72)] md:text-lg"
      >
        {about.intro}
      </motion.p>
      {variant === "cards" ? (
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {about.stats.map((s) => (
            <motion.div
              key={s.value}
              variants={aboutItem}
              className="glass flex items-center justify-between gap-3 rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(225,6,0,0.5)] hover:shadow-[0_0_24px_rgba(225,6,0,0.25)] md:block"
            >
              <p className="text-xl font-extrabold tracking-tight text-[#F5F5F5]">{s.value}</p>
              <p className="mono-label mt-0 text-right text-white/50 md:mt-2 md:text-left">{s.label}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div variants={aboutItem} className="mt-4 flex flex-wrap gap-2">
          {about.stats.map((s) => (
            <span
              key={s.value}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/75 transition-colors hover:border-[rgba(225,6,0,0.6)] hover:text-white"
            >
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent-red" />
              {s.value} · {s.label}
            </span>
          ))}
        </motion.div>
      )}
      <motion.a
        variants={aboutItem}
        href="#expertise"
        className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-accent-red"
      >
        More about me
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </motion.a>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { skills } from "@/data/skills";
import { site } from "@/data/site";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const panel = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "none", transition: { duration: 0.7, ease: EASE } },
};

const tile = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

export function Skills() {
  return (
    <section
      id="skills"
      aria-label="Skills and tech stack"
      className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-[96px] px-5"
    >
      {/* Foreground content */}
      <div className="grid gap-6 lg:grid-cols-[13fr_7fr]">
        {/* LEFT: icon tile panel */}
        <motion.div
          variants={panel}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="glass-panel rounded-3xl p-6"
        >
          <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-[2px] bg-accent-red" />
            {skills.eyebrow}
          </p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ staggerChildren: 0.03 }}
            className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6"
          >
            {skills.items.map((s) => (
              <motion.div
                key={s.name}
                variants={tile}
                className="glass-tile group flex min-h-[104px] flex-col items-center justify-start gap-2 rounded-2xl px-2 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent-red/60"
              >
                <span className="flex h-8 items-center transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(225,6,0,0.8)]">
                  <s.icon size={28} color={s.color} aria-hidden="true" />
                </span>
                <span className="line-clamp-2 min-h-[1.9em] text-center text-[10px] font-medium uppercase leading-snug tracking-wide text-white/45">
                  {s.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT: red quote card */}
        <motion.aside
          variants={panel}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          aria-label="Personal motto"
          className="glass-panel flex flex-col justify-between rounded-3xl border-accent-red/35 p-7"
        >
          <div>
            <Quote aria-hidden="true" className="h-5 w-5 fill-accent-red text-accent-red" />
            <p className="mt-4 text-lg leading-relaxed text-[#F5F5F5]">
              {site.tagline}
            </p>
          </div>
          <div className="mt-8">
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-[#F5F5F5]">
                    {site.name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/45">
                    AI & Data Science Student · Developer
                  </p>
                </div>
                <span aria-hidden="true" className="flex shrink-0 gap-1.5">
                  {[0, 1, 2, 3, 4].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 rounded-full bg-accent-red" />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

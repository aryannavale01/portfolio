"use client";

import { motion } from "framer-motion";
import { ProfileCard } from "@/components/sections/about/ProfileCard";
import { AboutContent, aboutList } from "@/components/sections/about/AboutContent";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function About() {
  return (
    <section
      id="about"
      aria-label="About"
      className="relative z-10 w-full scroll-mt-[96px] bg-transparent"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-[112px] md:px-5 md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mono-label mb-6 flex items-center gap-2 text-white/60"
        >
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent-red" />
          {"//about"}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 48, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="glass-quote rounded-3xl p-5 md:rounded-[32px] md:p-10"
        >
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-4">
              <ProfileCard />
            </div>
            <motion.div
              variants={aboutList}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="md:col-span-8"
            >
              <AboutContent />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

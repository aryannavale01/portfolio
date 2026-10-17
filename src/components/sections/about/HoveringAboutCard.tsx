"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { about } from "@/data/about";

export function HoveringAboutCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = () => setReduce(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
  });

  // Tilted portrait card (-6deg, straightens to 0deg on scroll)
  const portraitRotate = useTransform(smoothProgress, [0, 1], [-6, 0]);
  const portraitRotateY = useTransform(smoothProgress, [0, 1], [-8, 0]);
  const portraitY = useTransform(smoothProgress, [0, 1], [40, 0]);

  // Desktop pointer-driven tilt (max 6deg)
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || window.matchMedia("(hover: none)").matches) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = -((y - rect.height / 2) / rect.height) * 6;
    const ry = ((x - rect.width / 2) / rect.width) * 6;
    setTilt({ rx, ry });
  };

  const onMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="w-full max-w-6xl"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        animate={{
          rotateX: tilt.rx,
          rotateY: tilt.ry,
        }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="glass-panel relative w-full rounded-[28px] p-6 sm:p-8 md:p-10"
      >
        <div className="grid items-center gap-8 md:grid-cols-12 md:gap-12" style={{ transformStyle: "preserve-3d" }}>
          {/* Left: Tilted portrait card */}
          <div className="flex justify-center md:col-span-5" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              suppressHydrationWarning
              style={{
                rotateZ: portraitRotate,
                rotateY: portraitRotateY,
                y: portraitY,
                transformStyle: "preserve-3d",
                translateZ: "30px",
              }}
              className="relative aspect-[3/4] w-[75vw] max-w-[280px] overflow-hidden rounded-[24px] border border-white/15 bg-black/40 p-2 shadow-2xl md:w-full md:max-w-[320px]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[18px]">
                <Image
                  src="/about.jpg"
                  alt="Portrait of Aryan Navale"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 767px) 75vw, 320px"
                  className="object-cover object-top"
                />
                <div
                  className="glass-3 absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-mono text-[9px] tracking-widest text-white/90 sm:text-[10px]">
                    OPEN TO OPPORTUNITIES
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col items-start md:col-span-7" style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}>
            {/* Mono label with NO background fill */}
            <p className="mono-label text-white/50">{about.eyebrow}</p>

            {/* Heading never clipped */}
            <h2 className="font-display mt-2 text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
              {about.title}
            </h2>

            {/* 2 to 3 line intro */}
            <p className="mt-3 text-base leading-relaxed text-white/75 sm:text-lg">
              {about.intro}
            </p>

            {/* Badges - like OPEN TO OPPORTUNITIES style with colored dots */}
            <div className="mt-6 flex flex-wrap items-center gap-2" style={{ transform: "translateZ(30px)" }}>
              {[
                { label: "B.Tech", dotColor: "#60a5fa" },          // blue-400
                { label: "AI & Data Science", dotColor: "#a855f7" }, // purple-400
                { label: "Intern", dotColor: "#fb923c" },           // orange-400
                { label: "MKCL", dotColor: "#22d3ee" },             // cyan-400
                { label: "RAG + Agents", dotColor: "#f472b6" },     // pink-400
                { label: "Core focus", dotColor: "#34d399" },       // emerald-400
              ].map((item) => (
                <span
                  key={item.label}
                  className="glass-2 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:border-accent-red/50 transition-all duration-300"
                >
                  <span className="relative flex h-2 w-2 shrink-0 mr-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: item.dotColor }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: item.dotColor }} />
                  </span>
                  <span className="font-mono text-[9px] tracking-widest text-white/90 sm:text-[10px]">
                    {item.label}
                  </span>
                </span>
              ))}
            </div>

            {/* More about me link */}
            <a
              href="#expertise"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-accent-red"
            >
              More about me
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

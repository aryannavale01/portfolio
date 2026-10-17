"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/** Glass photo card: 6deg tilt straightening on scroll-in, glow + badge. */
export function ProfileCard() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqM = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setReduce(mq.matches);
      setMobile(mqM.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    mqM.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      mqM.removeEventListener("change", sync);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "center center"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 20 });
  const rotate = useTransform(smooth, [0, 1], [reduce ? 0 : mobile ? -3 : 6, 0]);
  const y = useTransform(smooth, [0, 1], [reduce ? 0 : 60, 0]);
  const opacity = useTransform(smooth, [0, 1], [reduce ? 1 : 0.5, 1]);

  return (
    <div ref={wrapRef} className="flex justify-center" style={{ perspective: "1200px" }}>
      <motion.div
        style={reduce ? undefined : { rotate, y, opacity, transformPerspective: 1200 }}
        className="relative w-[72vw] max-w-[280px] md:w-full md:max-w-[340px]"
      >
        <div
          aria-hidden="true"
          className="absolute -inset-[6%] rotate-45 scale-[0.8] blur-3xl md:scale-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(225,6,0,0.12))",
          }}
        />
        <div className="glass relative aspect-[3/4] overflow-hidden rounded-3xl p-2">
          <div className="relative h-full w-full overflow-hidden rounded-[20px]">
            <Image
              src="/about.jpg"
              alt="Portrait of Aryan Navale"
              fill
              quality={90}
              sizes="(max-width: 767px) 72vw, 340px"
              className="object-cover object-top"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)" }}
            />
            <div className="absolute inset-x-3 bottom-3 flex min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.45)] px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="truncate font-mono text-[9px] tracking-widest text-white/85 md:text-[10px]">
                OPEN TO OPPORTUNITIES
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

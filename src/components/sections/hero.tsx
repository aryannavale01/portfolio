"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Mail } from "lucide-react";
import { HeroCanvas, type HeroCanvasHandle } from "@/components/hero/hero-canvas";
import { HoveringAboutCard } from "@/components/sections/about/HoveringAboutCard";
import { hero } from "@/data/hero";

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Inline SVG icons for brands not in lucide-react
const GithubIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedinIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003zm-7 14.13z" />
  </svg>
);

const MailIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <Mail className={className} aria-hidden="true" {...props} />
);

export function Hero() {
  const wrapperRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const canvasHandle = useRef<HeroCanvasHandle>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const heroText = heroTextRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      // Rebuilt scrub ScrollTrigger: trigger "#home", start "top top", end "#about top 30%", scrub 0.5.
      // The frames finish turning as the About card reaches the upper third of the viewport.
      // NOTE: trigger is the section element itself, not the "#home" selector string:
      // gsap.context() scopes selector text to its scope root, and
      // root.querySelectorAll("#home") never matches the root itself, so the
      // string form logged "Element not found: #home" and the scrub never ran.
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: () => {
          const about = document.querySelector("#about");
          if (!about) return window.innerHeight;
          const aboutDocTop =
            about.getBoundingClientRect().top + window.scrollY;
          return Math.max(1, aboutDocTop - window.innerHeight * 0.3);
        },
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          canvasHandle.current?.draw(self.progress);

          // Fade out hero text over the initial scroll portion
          if (heroText) {
            const textAlpha = Math.max(0, 1 - self.progress / 0.35);
            const textY = -(self.progress / 0.35) * 36;
            heroText.style.opacity = String(textAlpha);
            heroText.style.transform = `translateY(${textY}px)`;
          }
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={wrapperRef}
      id="home"
      aria-label="Aryan Navale — Portfolio Home"
      className="relative w-full bg-[#050505]"
    >
      {/* Sticky stage: holds the canvas ONLY, no overlays, no scrims */}
      <div
        aria-hidden="true"
        className="stage sticky top-0 z-0 h-[100svh] -mb-[100svh] w-full overflow-hidden pointer-events-none bg-[#050505]"
      >
        <HeroCanvas ref={canvasHandle} />
      </div>

      {/* Hero copy in normal flow above canvas at z-10 */}
      <div className="hero-copy relative z-10 flex min-h-[100svh] w-full max-w-6xl mx-auto flex-col items-center justify-center px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] md:px-8 md:pb-20">
        <div className="flex flex-col justify-center items-start gap-5 max-w-2xl w-full px-4 sm:px-0 pt-20 sm:pt-32">
          <motion.h1
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "none" }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="hero-display text-5xl text-[#F5F5F5] sm:text-7xl md:text-[8rem] lg:text-[10rem] xl:text-[11rem] leading-[1.05] tracking-tight"
          >
            {hero.firstName}
            <br />
            <span className="text-accent-red">{hero.lastName}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
            className="max-w-md w-full"
          >
            <p className="text-xs font-medium text-white/60 sm:text-sm tracking-wide uppercase">{hero.role}</p>
            <p className="mt-2 text-base font-semibold tracking-tight text-[#F5F5F5] md:text-lg">
              {hero.tagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
            className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <a
              href={hero.primaryCta.href}
              className="h-11 w-full rounded-full bg-accent-red px-6 py-2.5 text-center text-xs font-semibold leading-5 text-white transition-colors hover:bg-[#b30500] sm:w-auto"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="glass-3 h-11 w-full rounded-full px-6 py-2.5 text-center text-xs font-semibold leading-5 text-[#F5F5F5] transition-colors hover:border-accent-red/50 sm:w-auto"
            >
              {hero.secondaryCta.label}
            </a>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: EASE }}
            className="flex items-center gap-3 sm:gap-4"
          >
            {hero.socials.map((s) => {
                const icons = { github: GithubIcon, linkedin: LinkedinIcon, mail: MailIcon };
                const Icon = icons[s.icon as keyof typeof icons];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="glass-2 h-9 w-9 rounded-full flex items-center justify-center text-white/70 transition-all duration-300 hover:text-accent-red hover:border-accent-red/50 hover:bg-white/[0.05] sm:h-10 sm:w-10"
                  >
                    <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden="true" />
                  </a>
                );
              })}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mono-label mt-2 flex items-center gap-2 text-white/45"
          >
            <motion.span
              aria-hidden="true"
              animate={{ y: [0, 5, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex"
            >
              <ArrowDown className="h-3.5 w-3.5 text-accent-red" />
            </motion.span>
            {hero.scrollHint}
          </motion.p>
        </div>
      </div>

      {/* Scrub spacer: reduced so the About card rises sooner */}
      <div className="scrub-spacer h-[40svh]" aria-hidden="true" />

      {/* About card: rises over the pinned canvas in normal flow */}
      <div
        id="about"
        className="relative z-10 -mt-[20svh] pb-[12svh] w-full max-w-6xl mx-auto px-5 md:px-8 scroll-mt-24"
      >
        <HoveringAboutCard />
      </div>
    </section>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { ArrowUpRight, Maximize2, MoveRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/bits/headings";
import { PanelBanner, PanelTitle } from "@/components/bits/section-banner";
import { projects, STATUS_STYLES, type Project } from "@/data/projects";
import { ProjectModal } from "@/components/sections/project-modal";

/* Layout: static 3×2 grid on desktop (≥1024), swipeable Embla carousel below. */

const HINT_VISIBLE_MS = 4500;
const NUDGE_DELAY_MS = 350;
const NUDGE_COOLDOWN_MS = 6000;
const NUDGE = { forward: 750, hold: 550, back: 650 } as const;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const [isCarousel, setIsCarousel] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const nudge = useRef({
    running: false,
    touched: false,
    raf: 0,
    lastRun: 0,
    timers: [] as number[],
  });

  // Desktop (≥1024) = static grid, small screens = carousel.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsCarousel(!mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setSnaps(emblaApi.scrollSnapList());
      setSelected(emblaApi.selectedScrollSnap());
    };
    sync();
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi]);

  const cancelNudge = useCallback(() => {
    const s = nudge.current;
    if (s.raf) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    }
    for (const t of s.timers) window.clearTimeout(t);
    s.timers = [];
    if (trackRef.current) trackRef.current.style.transform = "";
    s.running = false;
  }, []);

  // Any real interaction with the carousel cancels the demo and permanently
  // disables it (the user already knows they can swipe).
  useEffect(() => {
    if (!emblaApi) return;
    const onPointerDown = () => {
      cancelNudge();
      setShowSwipeHint(false);
    };
    const onSelect = () => {
      cancelNudge();
      setShowSwipeHint(false);
      nudge.current.touched = true;
    };
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, cancelNudge]);

  useEffect(
    () => () => {
      const s = nudge.current;
      if (s.raf) cancelAnimationFrame(s.raf);
      for (const t of s.timers) window.clearTimeout(t);
    },
    [],
  );

  /**
   * Swipe demo: when the section scrolls into view on a small screen, the
   * cards themselves slide to the next card and back — teaching the user the
   * section is scrollable. Visual-only (overrides the track transform without
   * touching Embla's internal scroll state, which stays at snap 0).
   */
  const runSwipeNudge = useCallback(() => {
    const s = nudge.current;
    const track = trackRef.current;
    const embla = emblaApi;
    if (!track || !embla) return;
    if (s.running || s.touched) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!embla.canScrollNext()) return;
    const now = performance.now();
    if (s.lastRun && now - s.lastRun < NUDGE_COOLDOWN_MS) return;

    const slides = track.children;
    if (slides.length < 2) return;
    const delta =
      (slides[1] as HTMLElement).offsetLeft -
      (slides[0] as HTMLElement).offsetLeft;
    if (delta <= 0) return;

    s.running = true;
    s.lastRun = now;
    setShowSwipeHint(true);
    s.timers.push(
      window.setTimeout(() => setShowSwipeHint(false), HINT_VISIBLE_MS),
    );

    s.timers.push(
      window.setTimeout(() => {
        const t0 = performance.now();
        const total = NUDGE.forward + NUDGE.hold + NUDGE.back;
        const step = (t: number) => {
          const elapsed = t - t0;
          let x = 0;
          if (elapsed < NUDGE.forward) {
            x = -delta * easeInOutCubic(elapsed / NUDGE.forward);
          } else if (elapsed < NUDGE.forward + NUDGE.hold) {
            x = -delta;
          } else {
            const bt = Math.min(
              1,
              (elapsed - NUDGE.forward - NUDGE.hold) / NUDGE.back,
            );
            x = -delta * (1 - easeInOutCubic(bt));
          }
          track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
          if (elapsed < total) {
            s.raf = requestAnimationFrame(step);
          } else {
            track.style.transform = "";
            s.raf = 0;
            s.running = false;
          }
        };
        s.raf = requestAnimationFrame(step);
      }, NUDGE_DELAY_MS),
    );
  }, [emblaApi]);

  // Fire the swipe demo each time the cards enter the viewport (until the
  // user has interacted with the carousel).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) runSwipeNudge();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [runSwipeNudge]);

  const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>, project: Project) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveProject(project);
    }
  };

  return (
    <section
      id="projects"
      aria-label="Projects"
      className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-[96px] px-5"
    >
      <Reveal>
        <PanelBanner>
          <div className="max-w-xl">
            <PanelTitle>{projects.eyebrow}</PanelTitle>
            <SplitHeading className="mt-4">{projects.heading}</SplitHeading>
            <p className="mt-3 text-white/60">{projects.sub}</p>
          </div>
        </PanelBanner>
      </Reveal>

      <Reveal className="mt-8">
        {/* Desktop: static 3×2 grid (3 per row). Small screens: swipeable carousel. */}
        <div ref={emblaRef} className="overflow-hidden lg:overflow-visible">
          <div
            ref={trackRef}
            className="flex gap-3 sm:gap-4 lg:grid lg:grid-cols-3 lg:gap-5"
          >
            {projects.items.map((p) => (
              <article
                key={p.title + p.tag}
                role="button"
                tabIndex={0}
                onClick={() => setActiveProject(p)}
                onKeyDown={(e) => handleCardKeyDown(e, p)}
                aria-label={`View details and architecture diagram for ${p.title}`}
                className="bg-[#0A0A0A] border border-white/10 group relative flex min-w-[85%] cursor-pointer flex-col overflow-hidden rounded-3xl p-4 focus-visible:outline-2 focus-visible:outline-accent-red transition-all duration-300 hover:border-accent-red/40 hover:shadow-[0_0_30px_rgba(225,5,0,0.15)] sm:min-w-[44%] sm:p-5 lg:min-w-0 lg:p-6"
              >
                {/* Single-row category + status chips (never wraps awkwardly) */}
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <p className="mono-label truncate text-[10px] text-[#FF6B63] sm:text-xs">{p.tag}</p>
                  {p.status && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/75 sm:px-2.5 sm:text-[10px]">
                      <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_STYLES[p.status]}`} />
                      {p.status}
                    </span>
                  )}
                </div>

                {/* Handcrafted thin-line SVG node diagram */}
                <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 sm:mt-4">
                  <Image
                    src={p.image}
                    alt={`${p.title} architecture schematic`}
                    fill
                    sizes="(max-width: 639px) 85vw, (max-width: 1023px) 44vw, 33vw"
                    className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="glass-3 absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-3 w-3 text-accent-red" />
                    <span>Inspect</span>
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-[#F5F5F5] sm:mt-4 sm:text-xl">{p.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60 line-clamp-3 sm:text-sm sm:leading-6">{p.body}</p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="glass-tile px-2 py-1 font-mono text-[9px] text-white/70 sm:px-3 sm:text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>

                {/* External links */}
                {(p.sourceUrl || p.liveUrl) && (
                  <div className="mt-auto flex flex-wrap gap-4 border-t border-white/10 pt-4 sm:mt-5" onClick={(e) => e.stopPropagation()}>
                    {p.sourceUrl && (
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white transition-colors hover:text-accent-red"
                      >
                        Source code <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white transition-colors hover:text-accent-red"
                      >
                        Live demo <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Swipe teaching hint — animates the cards once when they enter view */}
        {isCarousel && showSwipeHint && (
          <div className="mt-4 flex items-center justify-center gap-2 text-white/40 animate-pulse" role="status" aria-live="polite">
            <MoveRight className="h-5 w-5" />
            <span className="text-sm font-mono tracking-widest">Swipe to explore</span>
            <MoveRight className="h-5 w-5" />
          </div>
        )}

        {/* Carousel dots — only while the layout is a carousel */}
        {isCarousel && snaps.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Featured work slides">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selected}
                aria-label={`Go to project ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === selected ? "w-8 bg-accent-red" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </Reveal>

      {/* Focus-trapped glass dialog */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}

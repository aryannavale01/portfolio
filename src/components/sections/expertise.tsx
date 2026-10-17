"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/bits/headings";
import { PanelBanner, PanelTitle } from "@/components/bits/section-banner";
import { expertise } from "@/data/expertise";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";

export function Expertise() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: "start",
    slidesToScroll: 1,
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && snaps.length > 1) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => setShowSwipeHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, snaps.length]);

  const canScroll = snaps.length > 1;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Filter out card #4 (Mobile) - index 3 (0-based)
  const filteredItems = expertise.items.filter((_, i) => i !== 3);

  const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      emblaApi?.scrollTo(index);
    }
  };

  return (
    <section
      id="expertise"
      aria-label="Expertise"
      className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-[96px] px-5"
    >
      <Reveal>
        <PanelBanner>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <PanelTitle>{expertise.eyebrow}</PanelTitle>
              <SplitHeading className="mt-4">{expertise.heading}</SplitHeading>
              <p className="mt-3 max-w-2xl text-white/60 [text-wrap:pretty]">{expertise.sub}</p>
            </div>
          </div>
        </PanelBanner>
      </Reveal>
      
      <Reveal className="mt-8">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3">
            {filteredItems.map((item, i) => (
              <article
                key={item.index}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleCardKeyDown(e, i)}
                aria-label={`Expertise: ${item.title}`}
                className="bg-[#0A0A0A] border border-white/10 group relative min-w-[24%] sm:min-w-[24%] md:min-w-[20%] lg:min-w-[16.66%] xl:min-w-[16.66%] cursor-pointer overflow-hidden rounded-3xl p-5 sm:p-6 lg:p-7 focus-visible:outline-2 focus-visible:outline-accent-red transition-all duration-300 hover:border-accent-red/40 hover:shadow-[0_0_30px_rgba(225,5,0,0.15)]"
              >
                <span className="font-display text-4xl text-white/15 transition-colors group-hover:text-accent-red/60">
                  {item.index}
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#F5F5F5] [text-wrap:balance]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.chips.map((c) => (
                    <span
                      key={c}
                      className="bg-white/5 border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 rounded-full transition-all duration-300 hover:border-accent-red/50 hover:text-accent-red"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {snaps.length > 1 && (
          <>
            {/* Mobile swipe indicator */}
            {isMobile && showSwipeHint && (
              <div className="mt-4 flex items-center justify-center gap-2 text-white/40 animate-pulse" role="status" aria-live="polite">
                <MoveRight className="h-5 w-5" />
                <span className="text-sm font-mono tracking-widest">Swipe to explore</span>
                <MoveRight className="h-5 w-5" />
              </div>
            )}
            
            {/* Desktop navigation - only show when there's more content to scroll */}
            {!isMobile && canScroll && (
              <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Expertise slides">
                {snaps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === selected}
                    aria-label={`Go to expertise ${i + 1}`}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === selected ? "w-8 bg-accent-red" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Navigation buttons - only on desktop when scrolling is needed */}
            {!isMobile && canScroll && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => emblaApi?.scrollPrev()}
                  aria-label="Previous expertise"
                  disabled={selected === 0}
                >
                  ← Previous
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => emblaApi?.scrollNext()}
                  aria-label="Next expertise"
                  disabled={selected === snaps.length - 1}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </Reveal>

      {/* Education & Experience - keep as static grid below carousel */}
      <Reveal className="mt-16">
        <PanelBanner>
          <PanelTitle>Background</PanelTitle>
          <SplitHeading className="mt-4">{expertise.heading}</SplitHeading>
        </PanelBanner>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {(
            [
              { label: "Education", entries: expertise.education },
              { label: "Experience", entries: expertise.experience },
            ] as const
          ).map((block) => (
            <Reveal key={block.label}>
              <article className="bg-[#0A0A0A] border border-white/10 h-full rounded-3xl p-6 md:p-7">
                <p className="mono-label text-accent-red">{"// " + block.label}</p>
                <ul className="mt-4 space-y-4">
                  {block.entries.map((e) => (
                    <li key={e.title} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-red" />
                      <div>
                        <p className="font-bold text-[#F5F5F5] [text-wrap:balance]">{e.title}</p>
                        {e.lines.map((line) => (
                          <p key={line} className="mt-0.5 text-sm text-white/55">{line}</p>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

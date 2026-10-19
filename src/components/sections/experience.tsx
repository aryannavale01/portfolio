"use client";

import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/bits/headings";
import { PanelBanner, PanelTitle } from "@/components/bits/section-banner";
import { experienceTimeline } from "@/data/experience";

/**
 * Education & Experience as a glowing vertical timeline (replaces the old
 * two-card "Background" block that sat inside Expertise).
 *
 * Same shared shell as Skills/Projects/Contact (max-w-6xl wrapper, Reveal,
 * PanelBanner + PanelTitle + SplitHeading) and the shared glass tokens
 * (glass-panel). A thin glowing red line with a soft red pool behind it runs
 * down the middle on desktop (left edge on mobile); nodes are small red dots
 * with a single slow opacity pulse; cards alternate sides on desktop and
 * stack to the right of the line on mobile.
 */
export function Experience() {
  return (
    <section
      id="experience"
      aria-label="Education and Experience"
      className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-[96px] px-5"
    >
      <Reveal>
        <PanelBanner>
          <PanelTitle>Background</PanelTitle>
          <SplitHeading className="mt-4">Education & Experience</SplitHeading>
        </PanelBanner>
      </Reveal>

      {/* overflow-hidden clips the decorative pool so it can never cause
          horizontal scroll at any viewport width. */}
      <div className="relative mt-8 overflow-hidden">
        {/* Soft red light pool behind the line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 left-4 w-[min(560px,90vw)] -translate-x-1/2 md:left-1/2"
          style={{
            backgroundImage:
              "radial-gradient(closest-side, rgba(225, 6, 0, 0.14), transparent 75%)",
          }}
        />
        {/* Thin glowing red line */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-4 w-px -translate-x-1/2 shadow-[0_0_10px_rgba(225,6,0,0.55)] md:left-1/2"
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent, rgba(225, 6, 0, 0.75) 6%, rgba(225, 6, 0, 0.75) 94%, transparent)",
          }}
        />

        {experienceTimeline.map((entry, i) => {
          const left = i % 2 === 0;
          return (
            <div
              key={entry.kind}
              className="relative mb-10 pl-12 last:mb-0 md:grid md:grid-cols-2 md:gap-14 md:pl-0"
            >
              {/* Node: small red dot with a single slow opacity pulse */}
              <span
                aria-hidden="true"
                className="timeline-node absolute top-7 left-4 h-3 w-3 -translate-x-1/2 rounded-full bg-accent-red shadow-[0_0_14px_rgba(225,6,0,0.9)] md:left-1/2"
              />
              <article
                className={`glass-panel rounded-3xl p-6 md:p-7 ${
                  left ? "md:col-start-1" : "md:col-start-2"
                }`}
              >
                <p className="mono-label text-[#FF4438]">
                  {"// " + entry.kind}
                </p>
                <h3 className="mt-3 text-lg font-bold text-[#F5F5F5] [text-wrap:balance]">
                  {entry.title}
                </h3>
                {entry.lines.map((line) => (
                  <p key={line} className="mt-0.5 text-sm text-white/60">
                    {line}
                  </p>
                ))}
              </article>
              {/* Spacer keeps the alternating layout aligned on desktop */}
              <div
                aria-hidden="true"
                className={`hidden md:block ${left ? "md:col-start-2" : "md:col-start-1"}`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

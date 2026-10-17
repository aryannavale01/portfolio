"use client";

import { Award } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/bits/headings";
import { PanelBanner, PanelTitle } from "@/components/bits/section-banner";
import { certifications } from "@/data/certifications";

export function Certifications() {
  // Empty data = no section at all (never placeholder UI).
  if (certifications.items.length === 0) return null;

  return (
    <section id="certifications" aria-label="Certifications" className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-[96px] px-5">
      <Reveal>
        <PanelBanner>
          <PanelTitle>{certifications.eyebrow}</PanelTitle>
          <SplitHeading className="mt-4">{certifications.heading}</SplitHeading>
          <p className="mt-3 max-w-2xl text-white/60">{certifications.sub}</p>
        </PanelBanner>
      </Reveal>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.items.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.07}>
            <article className="glass-panel flex items-start gap-4 rounded-3xl p-6">
              <span className="glass-tile rounded-2xl p-3">
                <Award className="h-5 w-5 text-accent-red" />
              </span>
              <div>
                <h3 className="font-bold text-[#F5F5F5]">{c.title}</h3>
                <p className="mt-1 text-sm text-white/55">{c.issuer} · {c.year}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

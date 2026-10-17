"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/bits/headings";
import { PanelBanner, PanelTitle } from "@/components/bits/section-banner";
import { projects, STATUS_STYLES, type Project } from "@/data/projects";
import { ProjectModal } from "@/components/sections/project-modal";

export function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

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
        {/* Static grid: 4 visible on small devices (2×2), 6 on desktop (3×2) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {projects.items.map((p) => (
            <article
              key={p.title + p.tag}
              role="button"
              tabIndex={0}
              onClick={() => setActiveProject(p)}
              onKeyDown={(e) => handleCardKeyDown(e, p)}
              aria-label={`View details and architecture diagram for ${p.title}`}
              className="bg-[#0A0A0A] border border-white/10 group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl p-4 focus-visible:outline-2 focus-visible:outline-accent-red transition-all duration-300 hover:border-accent-red/40 hover:shadow-[0_0_30px_rgba(225,5,0,0.15)] sm:p-5 lg:p-6"
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
                  sizes="(max-width: 1024px) 50vw, 33vw"
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
      </Reveal>

      {/* Focus-trapped glass dialog */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}

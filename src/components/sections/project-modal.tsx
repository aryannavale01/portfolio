"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ArrowUpRight, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/data/projects";
import { STATUS_STYLES } from "@/data/projects";

type ProjectModalProps = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;

    // Save previous active element to restore focus on close
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Handle ESC key and Tab key cycling (focus trap)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previousActiveElement.current?.focus();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="glass-panel relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[rgba(14,10,10,0.88)] shadow-2xl"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="mono-label text-accent-red text-xs sm:text-sm">
                  {project.tag}
                </span>
                {project.status && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/75">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[project.status]}`}
                    />
                    {project.status}
                  </span>
                )}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close project details"
                className="glass-3 rounded-full p-2 text-white/70 transition-colors hover:text-white hover:border-accent-red/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-8">
              <div>
                <h2 id="modal-project-title" className="text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-3xl md:text-4xl">
                  {project.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-white/75 sm:text-lg">
                  {project.body}
                </p>
              </div>

              {/* Handcrafted Architecture Diagram */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="mono-label flex items-center gap-2 text-xs text-white/50">
                    <Layers className="h-3.5 w-3.5 text-accent-red" />
                    SYSTEM ARCHITECTURE DIAGRAM
                  </h3>
                  <span className="font-mono text-[10px] text-white/40">VECTOR SCHEMATIC</span>
                </div>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/12 bg-black/60 shadow-inner">
                  <Image
                    src={project.image}
                    alt={`${project.title} System Architecture Diagram`}
                    fill
                    priority
                    className="object-contain p-2"
                  />
                </div>
              </div>

              {/* Architecture Pipeline Stages */}
              {project.pipeline && project.pipeline.length > 0 && (
                <div>
                  <h3 className="mono-label text-xs text-white/50 mb-3">DATA & EXECUTION FLOW</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {project.pipeline.map((step, idx) => (
                      <div key={step} className="flex items-center gap-2">
                        <span className="glass-tile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/90">
                          <span className="font-mono text-[10px] text-accent-red">{idx + 1}.</span>
                          {step}
                        </span>
                        {idx < project.pipeline!.length - 1 && (
                          <span aria-hidden="true" className="text-white/30 text-xs">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges & Technical Decisions */}
              <div className="grid gap-6 md:grid-cols-2">
                {project.challenges && project.challenges.length > 0 && (
                  <div className="glass-tile p-5 rounded-2xl">
                    <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Key Technical Challenges
                    </h4>
                    <ul className="mt-3 space-y-2 text-xs leading-relaxed text-white/70">
                      {project.challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.decisions && project.decisions.length > 0 && (
                  <div className="glass-tile p-5 rounded-2xl">
                    <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Engineering Decisions
                    </h4>
                    <ul className="mt-3 space-y-2 text-xs leading-relaxed text-white/70">
                      {project.decisions.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tech Stack & Links */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="glass-tile px-3 py-1 font-mono text-[11px] text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {project.sourceUrl && (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="glass-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-accent-red"
                    >
                      Source Code <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent-red px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#b30500]"
                    >
                      Live Demo <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

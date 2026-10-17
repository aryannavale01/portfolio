"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { FRAMES } from "@/lib/frames";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ScrollCanvasHandle = {
  draw: (progress: number) => void;
};

export type ScrollCanvasConfig = {
  /** Key into FRAMES (e.g., "hero", "journey", "skills", "projects") */
  sequence: keyof typeof FRAMES;
  /** Desktop frame range: [startFrame1Based, endFrame1Based]. Inclusive. */
  frameRange: [number, number];
  /** Optional mobile frame range (defaults to frameRange). Use when mobile has fewer frames. */
  mobileFrameRange?: [number, number];
  /** Desktop focal X (0..1). 0.5 = center, >0.5 = right bias, <0.5 = left bias. */
  desktopFx?: number;
  /** Mobile focal X (0..1). */
  mobileFx?: number;
  /** Focal Y (0..1). 0.5 = center. 0.4 = slightly above center. */
  fy?: number;
  /** Scrub sensitivity. 0.5 = default. */
  scrub?: number;
  /** Section ID for ScrollTrigger (e.g., "#skills"). */
  triggerId: string;
};

/**
 * Production-grade scroll-scrubbed backdrop canvas.
 * Features: art-directed cover-fit, resize hardening, live focal tracking,
 * tiered preload, ResizeObserver settle timer, QA attributes.
 */
export const ScrollCanvas = forwardRef<ScrollCanvasHandle, { config: ScrollCanvasConfig; className?: string }>(
  function ScrollCanvas({ config, className = "" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const progressRef = useRef(0);
    const drawRef = useRef<(p: number) => void>(() => {});
    // Focal follows the live viewport, updated on resize.
    const focalRef = useRef({ fx: config.desktopFx ?? 0.5, fy: config.fy ?? 0.5 });

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let cancelled = false;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      const cfg = mobile ? FRAMES[config.sequence].mobile : FRAMES[config.sequence].desktop;
      const base = cfg.base;

      // Use mobileFrameRange if on mobile and provided, otherwise fall back to frameRange.
      const activeFrameRange = mobile && config.mobileFrameRange ? config.mobileFrameRange : config.frameRange;

      // Convert 1-based frameRange to 0-based indices.
      const startIdx = activeFrameRange[0] - 1;
      const endIdx = activeFrameRange[1] - 1;
      const frameSpan = endIdx - startIdx;

      // Mount-time focal; resize keeps it in sync.
      focalRef.current = {
        fx: mobile ? (config.mobileFx ?? 0.5) : (config.desktopFx ?? 0.5),
        fy: config.fy ?? 0.5,
      };

      const images: HTMLImageElement[] = [];
      imagesRef.current = images;
      let lastDrawn = -1;
      let failed = 0;

      // Cover-fit painter: frame ALWAYS fills viewport, overflow cropped around focal point.
      // Uses naturalWidth/naturalHeight (intrinsic), not layout width.
      const paint = (k: number) => {
        const img = images[k];
        if (!img || !img.complete || img.naturalWidth === 0) return;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const cw = canvas.width;
        const ch = canvas.height;
        if (cw === 0 || ch === 0) return;

        const { fx, fy } = focalRef.current;
        const s = Math.max(cw / iw, ch / ih);
        const w = iw * s;
        const h = ih * s;
        const x = (cw - w) * fx;
        const y = (ch - h) * fy;

        // QA: cover holds iff x<=0, y<=0, x+w>=cw, y+h>=ch
        canvas.dataset.fit = `${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)}`;
        canvas.dataset.progress = progressRef.current.toFixed(3);

        ctx.clearRect(0, 0, cw, ch);
        // 1px overscan to hide sub-pixel seams
        ctx.drawImage(img, x - 1, y - 1, w + 2, h + 2);
      };

      const drawForProgress = (p: number) => {
        progressRef.current = p;
        const effectiveProg = Math.min(1, Math.max(0, p));
        const floatIdx = startIdx + effectiveProg * frameSpan;
        const k = Math.min(endIdx, Math.max(startIdx, Math.round(floatIdx)));
        if (k === lastDrawn) return;
        const img = images[k];
        if (img && img.complete && img.naturalWidth !== 0) {
          lastDrawn = k;
          paint(k);
        }
      };

      const loadOne = (idx: number) =>
        new Promise<void>((resolve) => {
          let settled = false;
          const done = (ok: boolean) => {
            if (settled) return;
            settled = true;
            if (!ok) failed++;
            if (!cancelled) drawForProgress(progressRef.current);
            resolve();
          };
          const img = new Image();
          images[idx] = img;
          img.onload = () => done(true);
          img.onerror = () => done(false);
          img.src = `${base}${String(idx + 1).padStart(4, "0")}.webp`;
          if (img.decode) img.decode().then(() => done(true), () => {});
        });

      const idle = () =>
        new Promise<void>((r) => {
          const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
          if (ric) ric(() => r());
          else setTimeout(() => r(), 120);
        });

      // Tiered preload: start frame → every 8th → remainder in idle.
      void (async () => {
        await loadOne(startIdx);
        if (failed > 0) {
          canvas.classList.add("canvas-fallback");
          console.warn(`[${config.sequence}] frames failed to load`);
        }
        for (let k = startIdx + 8; k <= endIdx; k += 8) {
          if (cancelled) return;
          await loadOne(k);
        }
        for (let k = startIdx + 1; k <= endIdx; k++) {
          if ((k - startIdx) % 8 === 0) continue;
          if (cancelled) return;
          if ((k - startIdx) % 24 === 1) await idle();
          await loadOne(k);
        }
      })();

      const measureAndResize = () => {
        // Use parent element (sticky stage) for sizing, but fall back to viewport
        // if the parent rect seems invalid (e.g., sticky element unstuck).
        const parent = canvas.parentElement;
        if (!parent) return false;
        const rect = parent.getBoundingClientRect();
        
        // Fallback to viewport if parent rect is suspicious (0 or very small)
        const useViewport = rect.width < 100 || rect.height < 100;
        const measureRect = useViewport
          ? { width: window.innerWidth, height: window.innerHeight }
          : rect;
        
        if (measureRect.width < 1 || measureRect.height < 1) return false;
        
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nowMobile = window.matchMedia("(max-width: 767px)").matches;
        focalRef.current = {
          fx: nowMobile ? (config.mobileFx ?? 0.5) : (config.desktopFx ?? 0.5),
          fy: config.fy ?? 0.5,
        };
        const newW = Math.max(1, Math.floor(measureRect.width * dpr));
        const newH = Math.max(1, Math.round((newW * measureRect.height) / measureRect.width));
        
        // Never downsize the canvas backing store (prevents flicker when sticky unsticks)
        if (newW > canvas.width || newH > canvas.height) {
          canvas.width = newW;
          canvas.height = newH;
        }
        lastDrawn = -1;
        drawForProgress(progressRef.current);
        return true;
      };

      // Initial sizing with retry loop for hydration race.
      measureAndResize();
      let retries = 0;
      const retryInterval = window.setInterval(() => {
        if (measureAndResize()) {
          window.clearInterval(retryInterval);
        } else if (++retries > 50) {
          window.clearInterval(retryInterval);
          console.warn(`[${config.sequence}] canvas sizing failed after 5s`);
        }
      }, 100);

      window.addEventListener("resize", measureAndResize);
      window.addEventListener("orientationchange", measureAndResize);

      // Safety net: ResizeObserver on parent (sticky stage), not canvas.
      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        const parent = canvas.parentElement;
        if (parent) {
          ro = new ResizeObserver(() => measureAndResize());
          ro.observe(parent);
        }
      }

      // Direct draw entry: called by parent's ScrollTrigger.
      drawRef.current = (p: number) => drawForProgress(p);

      return () => {
        cancelled = true;
        window.clearInterval(retryInterval);
        window.removeEventListener("resize", measureAndResize);
        window.removeEventListener("orientationchange", measureAndResize);
        if (ro) ro.disconnect();
      };
    }, [config.sequence, config.frameRange, config.triggerId, config.desktopFx, config.mobileFx, config.fy, config.scrub]);

    useImperativeHandle(ref, () => ({
      draw: (p: number) => drawRef.current(p),
    }));

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        // No object-cover — paint() already fills via cover-fit.
        className={`block h-full w-full ${className}`}
      />
    );
  }
);
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JOURNEY } from "@/lib/journey";

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared scroll-scrubbed backdrop for the Expertise → Certifications
 * journey. Sticky (never fixed) canvas + flat scrim + vignette overlays.
 * Production-grade: art-directed cover-fit, resize hardening, focal tracking,
 * tiered preload, ResizeObserver settle timer.
 */
export function JourneyStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Focal follows the live viewport, updated on resize. Desktop keeps subject
  // centered (fx 0.5); mobile turn keeps face at x ~0.38 (fx 0.38);
  // fy 0.45 sits slightly above center so content below never covers it.
  const focalRef = useRef({ fx: 0.5, fy: 0.45 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    // NOTE: scrub + full preload run in all modes (owner request).
    // The motion is user-paced: frames only advance while scrolling.
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    const cfg = mobile ? JOURNEY.mobile : JOURNEY.desktop;
    const total = cfg.count;
    const base = cfg.base;

    // Set mount-time focal; resize keeps it in sync with the viewport.
    focalRef.current = { fx: mobile ? 0.38 : 0.5, fy: 0.45 };

    const images: HTMLImageElement[] = [];
    const state = { progress: 0 };
    let lastDrawn = -1;
    let failed = 0;

    // Cover-fit painter: the frame ALWAYS fills the viewport — zero letterbox
    // bars on any aspect — with overflow cropped around an art-directed focal
    // point so the subject survives the crop. Uses naturalWidth/naturalHeight
    // (intrinsic 1920x1080 / 1080x1350), not layout width, so detached preload
    // images measure correctly. The canvas itself stays sticky full-screen.
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

      // Recorded for automated fit QA: cover holds iff x<=0, y<=0,
      // x+w>=cw, y+h>=ch (attribute write only, no layout cost).
      canvas.dataset.fit = `${Math.round(x)},${Math.round(y)},${Math.round(
        w
      )},${Math.round(h)}`;
      canvas.dataset.progress = state.progress.toFixed(3);

      ctx.clearRect(0, 0, cw, ch);
      // 1px overscan to hide sub-pixel seams at the bleed edges
      ctx.drawImage(img, x - 1, y - 1, w + 2, h + 2);
    };

    const drawForProgress = (p: number) => {
      state.progress = p;
      // Smooth frame index (no Math.round jitter): advance only when the
      // float index crosses a 0.5 threshold relative to the last drawn frame.
      const floatIdx = p * (total - 1);
      const k = Math.min(total - 1, Math.max(0, Math.round(floatIdx)));
      if (k === lastDrawn) return;
      const img = images[k];
      if (img && img.complete && img.naturalWidth !== 0) {
        lastDrawn = k;
        paint(k);
      }
    };

    const loadOne = (k: number) =>
      new Promise<void>((resolve) => {
        let settled = false;
        const done = (ok: boolean) => {
          if (settled) return;
          settled = true;
          if (!ok) failed++;
          if (!cancelled) drawForProgress(state.progress);
          resolve();
        };
        const img = new Image();
        images[k] = img;
        img.onload = () => done(true);
        img.onerror = () => done(false);
        img.src = `${base}${String(k + 1).padStart(4, "0")}.webp`;
        if (img.decode) img.decode().then(() => done(true), () => {});
      });

    const idle = () =>
      new Promise<void>((r) => {
        const ric = (window as unknown as {
          requestIdleCallback?: (cb: () => void) => void;
        }).requestIdleCallback;
        if (ric) ric(() => r());
        else setTimeout(() => r(), 120);
      });

    // Tiered loading: frame 1 first, then every 8th, then the rest idle.
    // Runs immediately (owner request: scrub active in all modes).
    void (async () => {
      await loadOne(0);
      if (failed > 0) {
        stage.classList.add("journey-fallback");
        console.warn("[journey] frames failed to load, using gradient fallback");
      }
      for (let k = 8; k < total; k += 8) {
        if (cancelled) return;
        await loadOne(k);
      }
      for (let k = 1; k < total; k++) {
        if (k % 8 === 0) continue;
        if (cancelled) return;
        if (k % 24 === 1) await idle();
        await loadOne(k);
      }
    })();

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      // Focal follows the live viewport, not the mount-time breakpoint.
      const nowMobile = window.matchMedia("(max-width: 767px)").matches;
      focalRef.current = { fx: nowMobile ? 0.38 : 0.5, fy: 0.45 };
      const newW = Math.max(1, Math.floor(rect.width * dpr));
      // Derive height from width so backing aspect matches CSS aspect exactly.
      const newH = Math.max(
        1,
        Math.round((newW * rect.height) / rect.width)
      );
      if (canvas.width !== newW || canvas.height !== newH) {
        canvas.width = newW;
        canvas.height = newH;
      }
      lastDrawn = -1;
      drawForProgress(state.progress);
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // Safety net: if the stage was unmeasurable at mount (display:none, 0x0
    // rect during hydration), ResizeObserver catches the first real layout
    // and a one-shot timer guarantees one pass even without a resize event.
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => onResize());
      ro.observe(canvas);
    }
    const settle = window.setTimeout(() => onResize(), 1200);

    const gctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "#journey",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!cancelled) drawForProgress(self.progress);
        },
      });
    });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (ro) ro.disconnect();
      window.clearTimeout(settle);
      gctx.revert();
    };
    // Effect intentionally runs once; all inputs are mount-time constants.
  }, []);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="journey-stage pointer-events-none sticky top-0 z-0 h-[100svh] -mb-[100svh] w-full overflow-hidden bg-[#050505]"
    >
      <canvas
        ref={canvasRef}
        // NOTE: no object-cover — the 2D bitmap already fills the box via
        // paint(); object-fit would apply a SECOND crop/scale on top of it.
        className="block h-full w-full"
      />
    </div>
  );
}

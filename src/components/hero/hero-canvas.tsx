"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FRAMES } from "@/lib/frames";

export type HeroCanvasHandle = {
  /** Draw the frame for scroll progress 0..1. No React state involved. */
  draw: (progress: number) => void;
};

export const HeroCanvas = forwardRef<HeroCanvasHandle, { className?: string }>(
  function HeroCanvas({ className = "" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const progressRef = useRef(0);
    const drawRef = useRef<(p: number) => void>(() => {});
    // Focal follows the live viewport, updated on resize. Desktop turn keeps
    // the head right-of-center (fx 0.65); mobile turn keeps the face at
    // x ~0.35-0.40 (fx 0.37); fy 0.4 sits slightly above center so hero copy
    // at the bottom never covers the face.
    const focalRef = useRef({ fx: 0.65, fy: 0.4 });
    const [, setLoadedFirst] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    // NOTE: scrub + full preload run in all modes (owner request).
    // The motion is user-paced: frames only advance while scrolling.
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    // Set the mount-time focal; resize keeps it in sync with the viewport.
    focalRef.current = { fx: mobile ? 0.37 : 0.65, fy: 0.4 };

    const cfg = mobile ? FRAMES.hero.mobile : FRAMES.hero.desktop;
    const base = cfg.base;

    // Start hero section from frame 58 and end at frame 100 (desktop: 58-100, mobile: 29-50)
    const startFrame = mobile ? 29 : 58;
    const endFrame = mobile ? 50 : 100;
    const startIdx = startFrame - 1;
    const endIdx = endFrame - 1;
    const frameSpan = endIdx - startIdx;

    const images: HTMLImageElement[] = [];
    imagesRef.current = images;

    // Cover-fit painter (production): the frame ALWAYS fills the viewport —
    // zero letterbox bars on any aspect — with overflow cropped around an
    // art-directed focal point so the subject survives the crop.
    // Focal measured from the actual frames: desktop turn keeps the head
    // right-of-center (fx 0.65), mobile turn keeps the face at x ~0.35-0.40
    // (fx 0.37); fy sits slightly above center so copy at the bottom never
    // covers the face. Uses naturalWidth/naturalHeight (intrinsic
    // 1920x1080 / 1080x1350), not layout width, so detached preload images
    // measure correctly. The canvas itself stays sticky full-screen.
    const paint = (
      img1: HTMLImageElement,
      img2: HTMLImageElement | undefined,
      blend: number
    ) => {
      const iw = img1.naturalWidth;
      const ih = img1.naturalHeight;
      if (!iw || !ih) return;
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

      ctx.clearRect(0, 0, cw, ch);
      ctx.globalAlpha = 1.0;
      // 1px overscan to hide sub-pixel seams at the bleed edges
      ctx.drawImage(img1, x - 1, y - 1, w + 2, h + 2);

      if (
        blend > 0.02 &&
        img2 &&
        img2 !== img1 &&
        img2.complete &&
        img2.naturalWidth !== 0
      ) {
        ctx.globalAlpha = blend;
        ctx.drawImage(img2, x - 1, y - 1, w + 2, h + 2);
        ctx.globalAlpha = 1.0;
      }
    };

    const render = (prog: number) => {
      if (images.length === 0) return;
      const effectiveProg = Math.min(1, Math.max(0, prog));
      const floatIdx = startIdx + effectiveProg * frameSpan;
      const k1 = Math.min(endIdx, Math.max(startIdx, Math.floor(floatIdx)));
      const k2 = Math.min(endIdx, k1 + 1);
      const blend = floatIdx - k1;

      const img1 = images[k1];
      const img2 = images[k2];
      if (!img1 || !img1.complete || img1.naturalWidth === 0) return;
      paint(img1, img2, blend);
    };

    const loadOne = (idx: number) =>
      new Promise<void>((resolve) => {
        if (images[idx]) {
          resolve();
          return;
        }
        const img = new Image();
        images[idx] = img;
        img.onload = () => {
          if (!cancelled && idx === startIdx) {
            setLoadedFirst(true);
            render(progressRef.current);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = `${base}${String(idx + 1).padStart(4, "0")}.webp`;
        if (img.decode) {
          img.decode().then(() => resolve(), () => resolve());
        }
      });

    const idle = () =>
      new Promise<void>((r) => {
        const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
          .requestIdleCallback;
        if (ric) ric(() => r());
        else setTimeout(() => r(), 80);
      });

    // Tiered loading: frame 58 first (frame 29 on mobile), then every 4th frame, then remainder in idle time
    void (async () => {
      await loadOne(startIdx);

      for (let k = startIdx + 4; k <= endIdx; k += 4) {
        if (cancelled) return;
        await loadOne(k);
      }
      for (let k = startIdx + 1; k <= endIdx; k++) {
        if ((k - startIdx) % 4 === 0) continue;
        if (cancelled) return;
        if ((k - startIdx) % 8 === 1) await idle();
        await loadOne(k);
      }
    })();

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      // Focal follows the live viewport, not the mount-time breakpoint.
      const nowMobile = window.matchMedia("(max-width: 767px)").matches;
      focalRef.current = { fx: nowMobile ? 0.37 : 0.65, fy: 0.4 };
      const newW = Math.max(1, Math.floor(rect.width * dpr));
      // Derive height from width so backing aspect matches CSS aspect
      // exactly — no CSS resampling stretch or second crop on top of paint.
      const newH = Math.max(
        1,
        Math.round((newW * rect.height) / rect.width)
      );
      if (canvas.width !== newW || canvas.height !== newH) {
        canvas.width = newW;
        canvas.height = newH;
      }
      render(progressRef.current);
    };

    // Direct draw entry: called by the parent's ScrollTrigger, no React state.
    drawRef.current = (p: number) => {
      progressRef.current = p;
      const effectiveProg = Math.min(1, Math.max(0, p));
      const floatIdx = startIdx + effectiveProg * frameSpan;
      const k1 = Math.min(endIdx, Math.max(startIdx, Math.floor(floatIdx)));
      const k2 = Math.min(endIdx, k1 + 1);
      const blend = floatIdx - k1;
      canvas.dataset.frame = `${p.toFixed(3)}:${k1}`;

      const img1 = images[k1];
      const img2 = images[k2];
      if (!img1 || !img1.complete || img1.naturalWidth === 0) return;
      paint(img1, k1 !== k2 ? img2 : undefined, blend);
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

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (ro) ro.disconnect();
      window.clearTimeout(settle);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    draw: (p: number) => drawRef.current(p),
  }));

  return (
    <canvas
      ref={canvasRef}
      aria-label="Interactive 3D turning portrait sequence of Aryan Navale"
      // NOTE: no object-cover — the 2D bitmap already fills the box via
      // paint(); object-fit would apply a SECOND crop/scale on top of it.
      className={`block h-full w-full ${className}`}
    />
  );
});

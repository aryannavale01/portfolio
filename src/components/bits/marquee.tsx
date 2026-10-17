"use client";

import { cn } from "@/lib/utils";

/** Infinite marquee row. Direction + speed configurable; pauses when tab hidden. */
export function Marquee({
  children,
  reverse = false,
  duration = 30,
  className,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      {[0, 1].map((n) => (
        <div
          key={n}
          aria-hidden={n === 1}
          className={cn(
            "flex shrink-0 items-center gap-3 pr-3",
            reverse ? "animate-marquee-reverse" : "animate-marquee"
          )}
          style={{ animationDuration: `${duration}s` }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

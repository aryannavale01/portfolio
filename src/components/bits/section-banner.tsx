import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared section-header banners: one neutral dark glass + light red edge,
 * so Projects, Expertise and Certifications headers all match.
 */
function BannerShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-2 p-8 md:p-10",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Section header banner (same neutral dark glass with thin red edge). */
export function QuoteBanner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <BannerShell className={className}>{children}</BannerShell>;
}

/** Dark panel banner, exactly like the Skills & Tech Stack panel. */
export function PanelBanner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <BannerShell className={className}>{children}</BannerShell>;
}

/** Red square + bold uppercase title row, like the Skills panel header. */
export function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">
      <span aria-hidden="true" className="inline-block h-2 w-2 rounded-[2px] bg-accent-red" />
      {children}
    </p>
  );
}

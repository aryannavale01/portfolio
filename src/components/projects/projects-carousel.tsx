"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  { tag: "// PROJECT 01", title: "Multi-Tenant SaaS Platform" },
  { tag: "// PROJECT 02", title: "Realtime Analytics Engine" },
  { tag: "// PROJECT 03", title: "Edge Image Pipeline" },
];

export function ProjectsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  return (
    <div>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">
          {slides.map((s) => (
            <article
              key={s.tag}
              className="glass min-w-[78%] rounded-2xl p-6 sm:min-w-[42%]"
            >
              <p className="mono-label text-muted-foreground">{s.tag}</p>
              <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Draggable Embla slide — replace with real case study.
              </p>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous"
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next"
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

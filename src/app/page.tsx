"use client";

import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ExpertiseStage } from "@/components/sections/expertise-stage";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Certifications } from "@/components/sections/certifications";
import { Contact } from "@/components/sections/contact";
import { AmbientBackdrop } from "@/components/sections/ambient";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ExpertiseStage />
      {/* <main> must be `relative`: the hero's sticky stage (z-0) paints in the
          positioned tier, so only a positioned background paints above it —
          this masks the stage's -mb-[100svh] hang (100svh past #home) that the
          old opaque journey canvas used to cover. */}
      <main className="relative flex w-full flex-1 flex-col bg-[#050505]">
        {/* Solid #050505 continues the hero's baked bottom fade with no seam;
            decorative light pools live inside the wrapper below, behind content. */}
        <Experience />
        <div className="relative flex w-full flex-1 flex-col bg-[#050505]">
          <AmbientBackdrop />
          <div className="relative z-10 flex w-full flex-1 flex-col gap-16 pt-16 pb-24 md:gap-20">
            <Skills />
            <Projects />
            <Certifications />
            <Contact />
          </div>
          <div className="relative z-10">
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { JourneyStage } from "@/components/journey/journey-stage";
import { Footer } from "@/components/sections/footer";
import { ExpertiseStage } from "@/components/sections/expertise-stage";
import { JourneyContent } from "@/components/sections/journey-content";
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ExpertiseStage />
      <main className="flex w-full flex-1 flex-col">
        <div id="journey" className="relative flex w-full flex-1 flex-col gap-16 pb-24 pt-16 md:gap-20">
          <JourneyStage />
          <JourneyContent />
        </div>
      </main>
      <Footer />
    </>
  );
}

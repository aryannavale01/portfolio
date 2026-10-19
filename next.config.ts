import type { NextConfig } from "next";
import path from "path";
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Hostnames (no scheme/port) allowed to request dev assets — silences the
  // "Cross origin request detected from 127.0.0.1" dev warning.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
    // about.jpg renders at quality 90; 75 is next/image's default.
    qualities: [75, 90],
  },
};

// Perf-audit tooling (Phase 1): only active when ANALYZE=true is set for a build.
// With ANALYZE unset it returns the config unchanged.
const withAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  analyzerMode: "static",
  openAnalyzer: false,
});

export default withAnalyzer(nextConfig);

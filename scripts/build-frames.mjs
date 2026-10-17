import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const FFMPEG = "ffmpeg";
const CWEBP_CANDIDATES = [
  "cwebp",
  path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft/WinGet/Packages/Google.Libwebp_Microsoft.Winget.Source_8wekyb3d8bbwe/libwebp-1.6.0-windows-x64/bin/cwebp.exe"
  ),
];

function getCwebp() {
  for (const c of CWEBP_CANDIDATES) {
    if (!c) continue;
    try {
      const res = spawnSync(c, ["-version"]);
      if (res.status === 0) return c;
    } catch {}
  }
  return "cwebp";
}

const CWEBP = getCwebp();
console.log(`[build-frames] Using ffmpeg: ${FFMPEG}`);
console.log(`[build-frames] Using cwebp: ${CWEBP}`);

const ROOT = process.cwd();
const WORK = path.join(ROOT, "work");
const PUBLIC_FRAMES = path.join(ROOT, "public", "frames");

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(PUBLIC_FRAMES, { recursive: true });

// Worker queue for parallel cwebp execution
async function encodePngToWebpBatch(items, concurrency = Math.min(os.cpus().length || 4, 8)) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      const { png, webp } = items[i];
      spawnSync(CWEBP, ["-q", "82", "-m", "6", "-sharp_yuv", png, "-o", webp], {
        stdio: "ignore",
      });
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

async function runPipeline() {
  console.log("=== STEP 1: Hero Desktop (120 frames, 1920x1080) ===");
  const heroDesktopDir = path.join(PUBLIC_FRAMES, "hero");
  const heroDesktopPngDir = path.join(WORK, "hero_desktop_png");
  fs.mkdirSync(heroDesktopDir, { recursive: true });
  fs.mkdirSync(heroDesktopPngDir, { recursive: true });

  // 8.00s * 15fps = 120 frames
  // hqdn3d light denoise -> lanczos upscale 2560x1440 -> mild unsharp -> baked red-black curves grade -> lanczos 1920x1080 -> 12% bottom fade to #050505
  const heroDesktopFilter =
    "[0:v]fps=15,hqdn3d=1.2:1.2:3:3,scale=2560:1440:flags=lanczos,unsharp=5:5:0.5:5:5:0.0," +
    "curves=master='0/0 0.1/0.06 0.5/0.5 1/1':red='0/0.03 0.2/0.22 0.5/0.5 1/1':green='0/0 0.2/0.18 0.5/0.5 1/1':blue='0/0 0.2/0.17 0.5/0.5 1/1'," +
    "scale=1920:1080:flags=lanczos[base];" +
    "[1:v]format=rgba,geq=r='5':g='5':b='5':a='if(gt(Y, 1080*0.88), 255*(Y-1080*0.88)/(1080*0.12), 0)'[fade];" +
    "[base][fade]overlay=0:0[out]";

  execFileSync(
    FFMPEG,
    [
      "-y",
      "-i",
      path.join(ROOT, "source", "hero.mp4"),
      "-f",
      "lavfi",
      "-i",
      "color=c=#050505:s=1920x1080",
      "-filter_complex",
      heroDesktopFilter,
      "-map",
      "[out]",
      "-frames:v",
      "120",
      path.join(heroDesktopPngDir, "frame_%04d.png"),
    ],
    { stdio: "inherit" }
  );

  const heroDesktopPngs = fs
    .readdirSync(heroDesktopPngDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`[hero-desktop] Extracted ${heroDesktopPngs.length} PNGs, encoding to WebP...`);
  await encodePngToWebpBatch(
    heroDesktopPngs.map((f) => ({
      png: path.join(heroDesktopPngDir, f),
      webp: path.join(heroDesktopDir, f.replace(".png", ".webp")),
    }))
  );

  console.log("=== STEP 2: Hero Mobile (60 frames, 1080x1350 4:5 portrait crop) ===");
  const heroMobileDir = path.join(PUBLIC_FRAMES, "hero-mobile");
  const heroMobilePngDir = path.join(WORK, "hero_mobile_png");
  fs.mkdirSync(heroMobileDir, { recursive: true });
  fs.mkdirSync(heroMobilePngDir, { recursive: true });

  // Scale height to 1350 (width 2400), crop 1080x1350 centered on subject (x=1030), apply 12% bottom fade to #050505
  const heroMobileFilter =
    "[0:v]fps=7.5,hqdn3d=1.2:1.2:3:3,scale=2400:1350:flags=lanczos,unsharp=5:5:0.5:5:5:0.0," +
    "curves=master='0/0 0.1/0.06 0.5/0.5 1/1':red='0/0.03 0.2/0.22 0.5/0.5 1/1':green='0/0 0.2/0.18 0.5/0.5 1/1':blue='0/0 0.2/0.17 0.5/0.5 1/1'," +
    "crop=1080:1350:1030:0[base];" +
    "[1:v]format=rgba,geq=r='5':g='5':b='5':a='if(gt(Y, 1350*0.88), 255*(Y-1350*0.88)/(1350*0.12), 0)'[fade];" +
    "[base][fade]overlay=0:0[out]";

  execFileSync(
    FFMPEG,
    [
      "-y",
      "-i",
      path.join(ROOT, "source", "hero.mp4"),
      "-f",
      "lavfi",
      "-i",
      "color=c=#050505:s=1080x1350",
      "-filter_complex",
      heroMobileFilter,
      "-map",
      "[out]",
      "-frames:v",
      "60",
      path.join(heroMobilePngDir, "frame_%04d.png"),
    ],
    { stdio: "inherit" }
  );

  const heroMobilePngs = fs
    .readdirSync(heroMobilePngDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`[hero-mobile] Extracted ${heroMobilePngs.length} PNGs, encoding to WebP...`);
  await encodePngToWebpBatch(
    heroMobilePngs.map((f) => ({
      png: path.join(heroMobilePngDir, f),
      webp: path.join(heroMobileDir, f.replace(".png", ".webp")),
    }))
  );

  console.log("=== STEP 3: Journey Desktop (120 frames, 1920x1080) ===");
  const journeyDesktopDir = path.join(PUBLIC_FRAMES, "journey");
  const journeyDesktopPngDir = path.join(WORK, "journey_desktop_png");
  fs.mkdirSync(journeyDesktopDir, { recursive: true });
  fs.mkdirSync(journeyDesktopPngDir, { recursive: true });

  // 10.87s duration -> 120 frames = fps 11.03956
  // hqdn3d -> scale 2560x1440 lanczos -> unsharp -> grade -> scale 1920:1080 -> fade in 8 frames from #050505, fade out 8 frames to #050505
  const journeyDesktopFilter =
    "fps=11.0396,hqdn3d=1.2:1.2:3:3,scale=2560:1440:flags=lanczos,unsharp=5:5:0.5:5:5:0.0," +
    "curves=master='0/0 0.1/0.06 0.5/0.5 1/1':red='0/0.03 0.2/0.22 0.5/0.5 1/1':green='0/0 0.2/0.18 0.5/0.5 1/1':blue='0/0 0.2/0.17 0.5/0.5 1/1'," +
    "scale=1920:1080:flags=lanczos,fade=t=in:start_frame=0:nb_frames=8:color=0x050505,fade=t=out:start_frame=112:nb_frames=8:color=0x050505";

  execFileSync(
    FFMPEG,
    [
      "-y",
      "-i",
      path.join(ROOT, "source", "journey.mp4"),
      "-vf",
      journeyDesktopFilter,
      "-frames:v",
      "120",
      path.join(journeyDesktopPngDir, "frame_%04d.png"),
    ],
    { stdio: "inherit" }
  );

  const journeyDesktopPngs = fs
    .readdirSync(journeyDesktopPngDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`[journey-desktop] Extracted ${journeyDesktopPngs.length} PNGs, encoding to WebP...`);
  await encodePngToWebpBatch(
    journeyDesktopPngs.map((f) => ({
      png: path.join(journeyDesktopPngDir, f),
      webp: path.join(journeyDesktopDir, f.replace(".png", ".webp")),
    }))
  );

  console.log("=== STEP 4: Journey Mobile (60 frames, 1080x1350 4:5 portrait crop) ===");
  const journeyMobileDir = path.join(PUBLIC_FRAMES, "journey-mobile");
  const journeyMobilePngDir = path.join(WORK, "journey_mobile_png");
  fs.mkdirSync(journeyMobileDir, { recursive: true });
  fs.mkdirSync(journeyMobilePngDir, { recursive: true });

  // 60 frames = fps 5.5198
  // scale height to 1350 (width 2400) -> crop 1080x1350 centered -> fade in 8 frames from #050505, fade out 8 frames to #050505
  const journeyMobileFilter =
    "fps=5.5198,hqdn3d=1.2:1.2:3:3,scale=2400:1350:flags=lanczos,unsharp=5:5:0.5:5:5:0.0," +
    "curves=master='0/0 0.1/0.06 0.5/0.5 1/1':red='0/0.03 0.2/0.22 0.5/0.5 1/1':green='0/0 0.2/0.18 0.5/0.5 1/1':blue='0/0 0.2/0.17 0.5/0.5 1/1'," +
    "crop=1080:1350:(in_w-1080)/2:0,fade=t=in:start_frame=0:nb_frames=8:color=0x050505,fade=t=out:start_frame=52:nb_frames=8:color=0x050505";

  execFileSync(
    FFMPEG,
    [
      "-y",
      "-i",
      path.join(ROOT, "source", "journey.mp4"),
      "-vf",
      journeyMobileFilter,
      "-frames:v",
      "60",
      path.join(journeyMobilePngDir, "frame_%04d.png"),
    ],
    { stdio: "inherit" }
  );

  const journeyMobilePngs = fs
    .readdirSync(journeyMobilePngDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`[journey-mobile] Extracted ${journeyMobilePngs.length} PNGs, encoding to WebP...`);
  await encodePngToWebpBatch(
    journeyMobilePngs.map((f) => ({
      png: path.join(journeyMobilePngDir, f),
      webp: path.join(journeyMobileDir, f.replace(".png", ".webp")),
    }))
  );

  console.log("=== STEP 5: Verification & Metadata ===");
  function analyzeDir(dirName) {
    const files = fs.readdirSync(dirName).filter((f) => f.endsWith(".webp"));
    let totalSize = 0;
    let maxSize = 0;
    for (const f of files) {
      const sz = fs.statSync(path.join(dirName, f)).size;
      totalSize += sz;
      if (sz > maxSize) maxSize = sz;
    }
    return { count: files.length, totalSize, maxSize };
  }

  const hdStats = analyzeDir(heroDesktopDir);
  const hmStats = analyzeDir(heroMobileDir);
  const jdStats = analyzeDir(journeyDesktopDir);
  const jmStats = analyzeDir(journeyMobileDir);

  console.log(`Hero Desktop:   count=${hdStats.count}, max=${(hdStats.maxSize/1024).toFixed(1)}KB, total=${(hdStats.totalSize/1024/1024).toFixed(2)}MB`);
  console.log(`Hero Mobile:    count=${hmStats.count}, max=${(hmStats.maxSize/1024).toFixed(1)}KB, total=${(hmStats.totalSize/1024/1024).toFixed(2)}MB`);
  console.log(`Journey Desktop:count=${jdStats.count}, max=${(jdStats.maxSize/1024).toFixed(1)}KB, total=${(jdStats.totalSize/1024/1024).toFixed(2)}MB`);
  console.log(`Journey Mobile: count=${jmStats.count}, max=${(jmStats.maxSize/1024).toFixed(1)}KB, total=${(jmStats.totalSize/1024/1024).toFixed(2)}MB`);

  // Write metadata to src/lib/frames.ts and lib/frames.ts
  const framesContent = `// Frame sequence configuration and dimensions
// Auto-generated by scripts/build-frames.mjs

export const FRAMES = {
  hero: {
    desktop: {
      base: "/frames/hero/frame_",
      count: ${hdStats.count},
      width: 1920,
      height: 1080,
      maxSizeKb: ${Math.round(hdStats.maxSize / 1024)},
      totalSizeMb: ${(hdStats.totalSize / 1024 / 1024).toFixed(2)},
    },
    mobile: {
      base: "/frames/hero-mobile/frame_",
      count: ${hmStats.count},
      width: 1080,
      height: 1350,
      maxSizeKb: ${Math.round(hmStats.maxSize / 1024)},
      totalSizeMb: ${(hmStats.totalSize / 1024 / 1024).toFixed(2)},
    },
  },
  journey: {
    desktop: {
      base: "/frames/journey/frame_",
      count: ${jdStats.count},
      width: 1920,
      height: 1080,
      maxSizeKb: ${Math.round(jdStats.maxSize / 1024)},
      totalSizeMb: ${(jdStats.totalSize / 1024 / 1024).toFixed(2)},
    },
    mobile: {
      base: "/frames/journey-mobile/frame_",
      count: ${jmStats.count},
      width: 1080,
      height: 1350,
      maxSizeKb: ${Math.round(jmStats.maxSize / 1024)},
      totalSizeMb: ${(jmStats.totalSize / 1024 / 1024).toFixed(2)},
    },
  },
} as const;
`;

  fs.mkdirSync(path.join(ROOT, "src", "lib"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "lib"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "src", "lib", "frames.ts"), framesContent, "utf8");
  fs.writeFileSync(path.join(ROOT, "lib", "frames.ts"), framesContent, "utf8");
  console.log("[build-frames] Saved /src/lib/frames.ts and /lib/frames.ts");
}

runPipeline().catch((err) => {
  console.error(err);
  process.exit(1);
});

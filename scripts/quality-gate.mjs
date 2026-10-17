import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const QA_DIR = path.join(ROOT, "qa_crops");
fs.mkdirSync(QA_DIR, { recursive: true });

// Check side by side for frames 1, 30, 60, 90
// Old frames: frame-001 (0%), frame-010 (25%), frame-021 (50%), frame-031 (75%)
const pairs = [
  { newIndex: 1, oldFile: "public/hero-sequence/frame-001.webp", newFile: "public/frames/hero/frame_0001.webp" },
  { newIndex: 30, oldFile: "public/hero-sequence/frame-011.webp", newFile: "public/frames/hero/frame_0030.webp" },
  { newIndex: 60, oldFile: "public/hero-sequence/frame-021.webp", newFile: "public/frames/hero/frame_0060.webp" },
  { newIndex: 90, oldFile: "public/hero-sequence/frame-031.webp", newFile: "public/frames/hero/frame_0090.webp" },
];

for (const p of pairs) {
  const outCropOld = path.join(QA_DIR, `crop_old_f${p.newIndex}.png`);
  const outCropNew = path.join(QA_DIR, `crop_new_f${p.newIndex}.png`);
  const outSideBySide = path.join(QA_DIR, `side_by_side_f${p.newIndex}.png`);

  // Crop 600x600 around subject's shoulder/cap/face (x=1000..1600, y=100..700 in 1920x1080)
  // For old frames (1280x720), scale to 1920x1080 first
  execFileSync("ffmpeg", [
    "-y",
    "-i", path.join(ROOT, p.oldFile),
    "-vf", "scale=1920:1080:flags=lanczos,crop=600:600:1100:100",
    outCropOld,
  ]);

  execFileSync("ffmpeg", [
    "-y",
    "-i", path.join(ROOT, p.newFile),
    "-vf", "crop=600:600:1100:100",
    outCropNew,
  ]);

  // Merge side-by-side
  execFileSync("ffmpeg", [
    "-y",
    "-i", outCropOld,
    "-i", outCropNew,
    "-filter_complex",
    "[0:v][1:v]hstack=inputs=2[out]",
    "-map", "[out]",
    outSideBySide,
  ]);

  const oldStat = fs.statSync(path.join(ROOT, p.oldFile));
  const newStat = fs.statSync(path.join(ROOT, p.newFile));
  console.log(`Frame ${p.newIndex}: Old=${(oldStat.size/1024).toFixed(1)}KB, New=${(newStat.size/1024).toFixed(1)}KB -> ${outSideBySide}`);
}

console.log("Quality gate side-by-side crops generated.");

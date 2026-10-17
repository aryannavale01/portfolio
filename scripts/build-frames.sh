#!/usr/bin/env bash
# ==============================================================================
# Frame Pipeline: High Quality Video Frame Extraction & Optimization
# Part 1 of Aryan Navale Portfolio Overhaul
# ==============================================================================
set -euo pipefail

CWEBP_BIN="${CWEBP_BIN:-cwebp}"
FFMPEG_BIN="${FFMPEG_BIN:-ffmpeg}"

WORK_DIR="work"
SOURCE_HERO="source/hero.mp4"
SOURCE_JOURNEY="source/journey.mp4"

OUT_HERO_DESKTOP="public/frames/hero"
OUT_HERO_MOBILE="public/frames/hero-mobile"
OUT_JOURNEY_DESKTOP="public/frames/journey"
OUT_JOURNEY_MOBILE="public/frames/journey-mobile"

mkdir -p "$WORK_DIR/hero_raw" "$WORK_DIR/hero_graded" "$WORK_DIR/hero_mobile"
mkdir -p "$WORK_DIR/journey_raw" "$WORK_DIR/journey_graded" "$WORK_DIR/journey_mobile"
mkdir -p "$OUT_HERO_DESKTOP" "$OUT_HERO_MOBILE" "$OUT_JOURNEY_DESKTOP" "$OUT_JOURNEY_MOBILE"

# ------------------------------------------------------------------------------
# 1. Upscaling & Real-ESRGAN Documentation
# ------------------------------------------------------------------------------
# GPU Pipeline (NVIDIA GPU with CUDA):
# 1. Extract lossless frames:
#    $FFMPEG_BIN -i source/hero.mp4 -vsync 0 -pix_fmt rgb24 work/hero_raw/%04d.png
# 2. Denoise:
#    $FFMPEG_BIN -i work/hero_raw/%04d.png -vf "hqdn3d=1.2:1.2:3:3" work/hero_denoised/%04d.png
# 3. Real-ESRGAN 4x upscale on GPU:
#    realesrgan-ncnn-vulkan -i work/hero_denoised -o work/hero_upscaled_4x -n realesrgan-x4plus -s 4 -g 0
# 4. Downscale 4x to 2x (2560px wide) with Lanczos + unsharp:
#    $FFMPEG_BIN -i work/hero_upscaled_4x/%04d.png -vf "scale=2560:-1:flags=lanczos,unsharp=5:5:0.5:5:5:0.0" work/hero_2560/%04d.png
#
# CPU Fallback:
# High-precision Lanczos resize to 2560px + unsharp (5:5:0.5) + hqdn3d (1.2:1.2:3:3)

echo "[build-frames] Starting frame pipeline..."

# Run node pipeline executor
node scripts/build-frames.mjs

echo "[build-frames] Frame pipeline complete."

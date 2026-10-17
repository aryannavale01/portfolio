export const FRAME_COUNT_DESKTOP = 130;
export const FRAME_COUNT_MOBILE = 43;

export const JOURNEY = {
  desktop: { base: "/frames/journey/frame_", count: FRAME_COUNT_DESKTOP },
  mobile: { base: "/frames/journey-mobile/frame_", count: FRAME_COUNT_MOBILE },
} as const;

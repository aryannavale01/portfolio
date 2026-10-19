/**
 * Education & Experience timeline entries.
 * Order matters: Experience first, Education second (timeline runs top-down).
 * Only real supplied text — the compact "Currently" row is intentionally
 * omitted until real copy exists.
 */
export const experienceTimeline = [
  {
    kind: "Experience",
    title: "Software Development Intern",
    lines: ["MKCL"],
  },
  {
    kind: "Education",
    title: "B.Tech, AI & Data Science",
    lines: ["VPKBIET Baramati", "Graduating 2027"],
  },
] as const;

export type Certification = {
  issuer: string;
  title: string;
  year: string;
};

export const certifications = {
  eyebrow: "System Badges",
  heading: "Certifications",
  sub: "Credentials I've earned along the way.",
  items: [] as readonly Certification[],
} as const;

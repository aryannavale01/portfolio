export type ProjectStatus = "Live" | "In progress" | "Research";

export type Project = {
  tag: string;
  title: string;
  body: string;
  tags: readonly string[];
  image: string;
  status?: ProjectStatus;
  sourceUrl?: string;
  liveUrl?: string;
  pipeline?: readonly string[];
  challenges?: readonly string[];
  decisions?: readonly string[];
};

export const STATUS_STYLES: Record<ProjectStatus, string> = {
  Live: "bg-emerald-400",
  "In progress": "bg-amber-400",
  Research: "bg-sky-400",
};

export const projects = {
  eyebrow: "Featured Work",
  heading: "Projects that define my journey",
  sub: "A selection of ML, mobile and web work I've built and shipped.",
  items: [
    {
      tag: "Agents • Compliance",
      title: "DCR Mitra",
      body: "Multi-agent pre-check for building development proposals against Indian municipal bylaws, with a compliance score.",
      tags: ["FastAPI", "PostgreSQL", "LangChain"],
      image: "/projects/project-1.svg",
      status: "In progress",
      pipeline: [
        "Municipal Bylaw PDF",
        "Ingestion & Chunking",
        "LangChain Agent",
        "Bylaw Vector DB",
        "Compliance Scorecard Engine",
      ],
      challenges: [
        "Inconsistent and unstructured table layouts across multi-hundred page municipal gazettes.",
        "Deterministic rule parsing versus semantic guideline extraction without LLM hallucination.",
        "Sub-second verification latency across complex multi-clause setback and FSI computations.",
      ],
      decisions: [
        "Separated strict mathematical formulas into Python execution sandboxes while utilizing LangChain for semantic bylaw interpretation.",
        "pgvector PostgreSQL storage partitioned by municipal jurisdiction for deterministic legal scope queries.",
      ],
    },
    {
      tag: "Privacy • Android",
      title: "SimpleX Vault",
      body: "Privacy-first SimpleX Chat fork behind a Notes disguise, built additive-only so SimpleX core is untouched.",
      tags: ["Kotlin", "Jetpack Compose"],
      image: "/projects/project-2.svg",
      status: "In progress",
      pipeline: [
        "Notes UI Disguise",
        "Biometric / Pattern Auth",
        "Additive Bridge",
        "SimpleX Core Chat Client (isolated)",
        "Encrypted Peer Channel",
      ],
      challenges: [
        "Preserving upstream git mergeability with zero changes to SimpleX core cryptographic engines.",
        "Preventing Android OS process memory dumps from revealing chat state during task switcher previews.",
        "Biometric keystore key rotation synchronization without invalidating active peer ratchet keys.",
      ],
      decisions: [
        "Strict additive-only architecture wrapping upstream SimpleX dependencies inside a segregated module.",
        "Stealth Notes cover UI rendered as default activity with fake note database stored in room cache.",
      ],
    },
    {
      tag: "Android • Fintech",
      title: "TallyWise",
      body: "Android expense tracker that detects and categorizes transactions automatically from SMS.",
      tags: ["Kotlin", "Room"],
      image: "/projects/project-3.svg",
      status: "In progress",
      pipeline: [
        "Telephony SMS Listener",
        "Regex/NLP Classifier",
        "Category Engine",
        "Room Local DB",
        "Monthly Budget Analytics",
      ],
      challenges: [
        "Unstandardized transactional SMS formats across 40+ Indian private and public sector banks.",
        "Strict battery consumption and background execution restrictions under modern Android Doze mode.",
        "Zero-cloud guarantee ensuring financial records never leave the physical handset.",
      ],
      decisions: [
        "Rule-based deterministic token parser paired with lightweight on-device categorizer running inside Room transactions.",
        "BroadcastReceiver with WorkManager scheduling to guarantee 0% telemetry transmission.",
      ],
    },
    {
      tag: "Web • NGO Tooling",
      title: "NGO ERP",
      body: "Enrollment, document verification and certificate generation for an NGO.",
      tags: ["Next.js 15", "Prisma", "Supabase"],
      image: "/projects/project-4.svg",
      status: "Live",
      pipeline: [
        "Next.js 15 SSR Frontend",
        "Auth & Verification Middleware",
        "Prisma ORM",
        "Supabase Postgres",
        "Certificate Gen Pipeline",
      ],
      challenges: [
        "High-concurrency document uploads over intermittent rural network connections.",
        "Tamper-proof verifiable credential generation with public QR code cryptographic signature checks.",
        "Strict multi-tenant role-based access control separating volunteers, verifiers, and state directors.",
      ],
      decisions: [
        "Next.js 15 App Router server actions with Prisma ORM and Supabase storage with pre-signed chunked uploads.",
        "Automated PDF certificate stamping pipeline embedding SHA-256 validation seals.",
      ],
    },
    {
      tag: "AI • Voice",
      title: "TalkTwin",
      body: "Multilingual avatar platform; TTS and voice-cloning research across 13 languages.",
      tags: ["Python", "TTS", "LLMs"],
      image: "/projects/project-5.svg",
      status: "Research",
      pipeline: [
        "Audio Input Stream",
        "Voice Feature Extraction",
        "Multi-lingual TTS (13 langs)",
        "Lip-sync Avatar Engine",
        "WebGL Stream",
      ],
      challenges: [
        "Phoneme-to-viseme alignment lag across diverse linguistic phoneme inventories.",
        "Maintaining natural prosody and emotional cadence in zero-shot synthesized target languages.",
        "Streaming 60fps avatar facial mesh deformation in real-time WebGL canvas.",
      ],
      decisions: [
        "Decoupled audio token generation from viseme keyframe calculation using lightweight event dispatchers.",
        "PyTorch inference pipeline optimized with ONNX Runtime for low-latency browser streaming.",
      ],
    },
    {
      tag: "Placeholder • Upcoming",
      title: "Project Six",
      body: "Placeholder slot for your next project — replace this entry in src/data/projects.ts with real details.",
      tags: ["Editable", "Placeholder", "Soon"],
      image: "/projects/project-6.svg",
      status: "Research",
      pipeline: ["Input Stage", "Ingestion", "Core Logic", "Processing", "Output / Delivery"],
      challenges: [
        "Replace this with a real challenge your project solved.",
        "Replace this with a second real challenge.",
        "Replace this with a third real challenge.",
      ],
      decisions: [
        "Replace this with a real technical decision you made.",
        "Replace this with a second real technical decision.",
      ],
    },
  ] as Project[],
} as const;

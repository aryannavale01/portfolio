import type { ComponentType } from "react";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiNodedotjs,
  SiPython,
  SiLangchain,
  SiPytorch,
  SiScikitlearn,
  SiSupabase,
  SiPrisma,
  SiFirebase,
  SiPostgresql,
  SiKotlin,
  SiJetpackcompose,
  SiAndroidstudio,
  SiGit,
  SiGithub,
  SiVercel,
} from "react-icons/si";
import { Code2 } from "lucide-react";

export type SkillIcon = ComponentType<{
  size?: string | number;
  color?: string;
  className?: string;
}>;

export type Skill = { name: string; icon: SkillIcon; color: string };

// Official brand colors; near-black marks use white so they read on dark.
export const skills = {
  eyebrow: "Skills & Tech Stack",
  items: [
    { name: "React.js", icon: SiReact, color: "#61DAFB" },
    { name: "Next.js", icon: SiNextdotjs, color: "#FFFFFF" },
    { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
    { name: "Framer Motion", icon: SiFramer, color: "#0055FF" },
    { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
    { name: "Python", icon: SiPython, color: "#3776AB" },
    { name: "LangChain", icon: SiLangchain, color: "#FFFFFF" },
    { name: "PyTorch", icon: SiPytorch, color: "#EE4C2C" },
    { name: "Scikit-learn", icon: SiScikitlearn, color: "#F7931E" },
    { name: "Supabase", icon: SiSupabase, color: "#3FCF8E" },
    { name: "Prisma", icon: SiPrisma, color: "#FFFFFF" },
    { name: "Firebase", icon: SiFirebase, color: "#DD2C00" },
    { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    { name: "Kotlin", icon: SiKotlin, color: "#7F52FF" },
    { name: "Jetpack Compose", icon: SiJetpackcompose, color: "#4285F4" },
    { name: "Android Studio", icon: SiAndroidstudio, color: "#3DDC84" },
    { name: "Git", icon: SiGit, color: "#F05032" },
    { name: "GitHub", icon: SiGithub, color: "#FFFFFF" },
    { name: "VS Code", icon: Code2, color: "#007ACC" },
    { name: "Vercel", icon: SiVercel, color: "#FFFFFF" },
  ] as const satisfies readonly { name: string; icon: SkillIcon; color: string }[],
} as const;

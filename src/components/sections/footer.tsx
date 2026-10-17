import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 pb-10">
      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-3xl px-6 py-5 text-sm text-white/50 sm:flex-row">
        <p suppressHydrationWarning>
          © 2026 {site.name} · {site.tagline}
        </p>
        <ul className="flex gap-5">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} className="inline-block px-2 py-3 transition-colors hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

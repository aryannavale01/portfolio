"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2, Send, Mail, Briefcase, Download } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow, SplitHeading } from "@/components/bits/headings";
import { Magnetic } from "@/components/bits/magnetic";
import { Input } from "@/components/ui/input";
import { site } from "@/data/site";

const SOCIAL_ICONS: Record<string, typeof Mail> = {
  GitHub: SiGithub as unknown as typeof Mail,
  LinkedIn: Briefcase,
  Email: Mail,
};

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message needs at least 10 characters"),
});

export function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Send failed");
      setStatus("sent");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      setStatus("error");
    }
  };

  return (
    <section id="contact" aria-label="Contact" className="mx-auto w-full max-w-6xl scroll-mt-[96px] px-5">
      <Reveal>
        <div className="glass-panel rounded-3xl p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>{"// CONTACT"}</Eyebrow>
              <SplitHeading className="mt-4">Let&apos;s build something intelligent</SplitHeading>
              <p className="mt-3 max-w-sm text-white/60">
                Open to internships, collaborations and interesting problems. I usually reply within a day.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {site.socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.label] ?? Mail;
                  return (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target={s.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="glass-tile inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-white/75 transition-colors hover:border-accent-red/50 hover:text-white"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {s.label}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <a
                    href="/resume.pdf"
                    download
                    className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F5] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download resume
                  </a>
                </li>
              </ul>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80" htmlFor="contact-name">Name</label>
                <Input id="contact-name" name="name" placeholder="Your name" autoComplete="name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80" htmlFor="contact-email">Email</label>
                <Input id="contact-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project…"
                  className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#8A8A8A]"
                />
              </div>
              <Magnetic>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-red px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b30500] disabled:opacity-60 md:w-auto"
                >
                  {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </Magnetic>
              {status === "sent" && (
                <p role="status" className="text-sm text-emerald-400">Message sent — I&apos;ll get back to you soon.</p>
              )}
              {status === "error" && (
                <p role="alert" className="text-sm text-red-400">{error}</p>
              )}
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

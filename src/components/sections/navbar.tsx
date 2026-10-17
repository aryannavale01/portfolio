"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type Lenis from "lenis";
import { site } from "@/data/site";
import { certifications } from "@/data/certifications";
import { Magnetic } from "@/components/bits/magnetic";

function scrollToSection(href: string) {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.scrollTo(href, { offset: -96, duration: 1.4 });
    return;
  }
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

function onNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  scrollToSection(href);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  const navLinks = useMemo(
    () => [
      ...site.nav.filter((l) => l.href !== "#contact"),
      ...(certifications.items && certifications.items.length > 0
        ? [{ label: "Certifications", href: "#certifications" }]
        : []),
      { label: "Contact", href: "#contact" },
    ],
    []
  );

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [open]);

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace("#", ""));

    const handleScroll = () => {
      const scrollPos = window.scrollY + 120; // 96px navbar offset + threshold
      const aboutEl = document.getElementById("about");
      const aboutTop = aboutEl ? aboutEl.getBoundingClientRect().top + window.scrollY : Infinity;

      if (scrollPos < aboutTop) {
        setActive("#home");
        return;
      }

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        const top = sec.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPos) {
          setActive(`#${sec.id}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navLinks]);

  const linkCls = (href: string) =>
    href === active
      ? "text-white font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]"
      : "text-white/80 hover:text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[10px] md:px-8 md:pt-4">
      <nav
        aria-label="Primary"
        className="glass-3 mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-5 pr-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] md:h-16"
      >
        <a
          href="#home"
          onClick={(e) => onNavClick(e, "#home")}
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#F5F5F5]"
        >
          <Image src="/icon.svg" alt="Aryan Navale logo" width={30} height={30} className="rounded-[9px]" />
          {site.shortName}
          <span aria-hidden="true" className="-ml-2 text-accent-red">.</span>
        </a>
        <ul className="hidden items-center gap-1 text-sm transition-colors lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => onNavClick(e, l.href)}
                aria-current={l.href === active ? "true" : undefined}
                className={`relative rounded-full px-4 py-3 transition-colors ${linkCls(l.href)}`}
              >
                {l.href === active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    aria-hidden="true"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.08]"
                  />
                )}
                <span className="relative">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Magnetic>
            <a
              href="#contact"
              onClick={(e) => onNavClick(e, "#contact")}
              className="hidden h-11 items-center rounded-full bg-[#F5F5F5] px-5 text-sm font-semibold text-black transition-colors hover:bg-white sm:inline-flex"
            >
              Hire me
            </a>
          </Magnetic>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="glass-3 rounded-full p-3 text-white md:p-2.5 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="glass-3 fixed inset-0 z-50 flex flex-col lg:hidden"
          >
            <div className="flex h-14 items-center justify-between px-3 pt-[10px]">
              <span className="pl-5 text-lg font-extrabold tracking-tight text-[#F5F5F5]">
                {site.shortName}
                <span aria-hidden="true" className="text-accent-red">.</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full border border-[rgba(255,255,255,0.10)] bg-white/[0.06] p-3 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex flex-1 flex-col justify-center gap-1 px-6 pb-16">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                >
                  <a
                    href={l.href}
                    aria-current={l.href === active ? "true" : undefined}
                    onClick={(e) => {
                      setOpen(false);
                      onNavClick(e, l.href);
                    }}
                    className={`block rounded-2xl px-4 py-3 font-display text-3xl tracking-tight transition-colors hover:bg-white/10 hover:text-white ${
                      l.href === active ? "text-white" : "text-[rgba(255,255,255,0.78)]"
                    }`}
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Principal" className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" aria-label="Retour à l'accueil" className="flex items-center gap-2.5 text-white">
          <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-violet-500">
            <span className="text-[11px] font-black tracking-tight">V</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Voyted</span>
        </Link>

        {/* Nav items — desktop */}
        <div className="hidden items-center gap-0.5 md:flex">
          {[
            { label: "Fonctionnalités", href: "#features" },
            { label: "Tarifs", href: "#pricing" },
            { label: "Roadmap", href: "#roadmap" },
            { label: "Contact", href: "mailto:contact@voyted.app" },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white md:block"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-white px-3 py-1.5 text-[13px] font-semibold text-black transition-colors hover:bg-zinc-100"
          >
            S&apos;inscrire
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="4.5" width="14" height="1" rx="0.5" style={{ transformOrigin: "center", transition: "160ms", transform: mobileOpen ? "translateY(3px) rotate(45deg)" : "none" }} />
              <rect x="1" y="10.5" width="14" height="1" rx="0.5" style={{ transformOrigin: "center", transition: "160ms", transform: mobileOpen ? "translateY(-3px) rotate(-45deg)" : "none" }} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#0a0a0a] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {[
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "Roadmap", href: "#roadmap" },
              { label: "Contact", href: "mailto:contact@voyted.app" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-white/[0.06] pt-2">
              <Link href="/login" className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-white">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

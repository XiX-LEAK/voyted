"use client";

import Link from "next/link";
import { useState } from "react";

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 z-50 w-full"
        style={{
          background: "rgba(8,8,8,0.92)",
          backdropFilter: "blur(12px) saturate(150%)",
          WebkitBackdropFilter: "blur(12px) saturate(150%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <nav
          aria-label="Principal"
          className="relative mx-auto flex h-12 max-w-[1200px] items-center px-4"
        >
          <ul className="flex w-full items-center" aria-label="Navigation du site">
            {/* Logo */}
            <li className="flex items-center">
              <Link
                href="/"
                aria-label="Retour à l'accueil"
                className="flex items-center text-white"
                style={{ WebkitTouchCallout: "none", display: "flex" }}
              >
                <svg height="22" viewBox="0 0 120 30" fill="currentColor" aria-label="Voyted">
                  <text x="0" y="24" fontSize="22" fontWeight="700" fontFamily="-apple-system,BlinkMacSystemFont,'Inter',sans-serif" letterSpacing="-0.5">
                    Voyted
                  </text>
                </svg>
              </Link>
            </li>

            {/* Right side */}
            <div className="ml-auto flex items-center">
              {/* Nav links — desktop */}
              <div className="hidden items-center md:flex">
                {[
                  { label: "Fonctionnalités", href: "#features" },
                  { label: "Tarifs", href: "#pricing" },
                  { label: "Roadmap", href: "#roadmap" },
                  { label: "Contact", href: "mailto:contact@voyted.app" },
                ].map((item) => (
                  <li key={item.href} className="list-none">
                    <a
                      href={item.href}
                      className="block px-3 py-1.5 text-[13px] font-medium text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                      style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </div>

              <div className="mx-3 hidden h-4 w-px bg-white/10 md:block" />

              {/* Buttons */}
              <div className="flex items-center gap-1.5">
                <li className="hidden list-none md:block">
                  <Link
                    href="/login"
                    className="block px-3 py-1.5 text-[13px] font-medium text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                    style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}
                  >
                    Se connecter
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/register"
                    className="inline-flex h-7 items-center rounded-[6px] bg-white px-3 text-[13px] font-semibold text-black transition-colors hover:bg-zinc-100"
                    style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}
                  >
                    S&apos;inscrire
                  </Link>
                </li>

                {/* Mobile hamburger */}
                <li className="list-none md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-expanded={mobileOpen}
                    className="flex h-8 w-8 items-center justify-center text-[rgba(255,255,255,0.6)] hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect
                        x="1" y="7.5" width="14" height="1" rx="0.5"
                        style={{
                          transformOrigin: "center",
                          transition: "160ms cubic-bezier(0.16,1,0.3,1)",
                          transform: mobileOpen ? "translateY(0) rotate(45deg)" : "translateY(-3.5px)",
                        }}
                      />
                      <rect
                        x="1" y="7.5" width="14" height="1" rx="0.5"
                        style={{
                          transformOrigin: "center",
                          transition: "160ms cubic-bezier(0.16,1,0.3,1)",
                          transform: mobileOpen ? "translateY(0) rotate(-45deg)" : "translateY(3.5px)",
                        }}
                      />
                    </svg>
                  </button>
                </li>
              </div>
            </div>
          </ul>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="border-t border-white/[0.06] px-4 py-3 md:hidden"
            style={{ background: "rgba(8,8,8,0.98)" }}
          >
            {[
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "Roadmap", href: "#roadmap" },
              { label: "Contact", href: "mailto:contact@voyted.app" },
              { label: "Se connecter", href: "/login" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm text-[rgba(255,255,255,0.6)] hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

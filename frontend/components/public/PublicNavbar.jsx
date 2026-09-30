"use client";

import Link from "next/link";
import { useState } from "react";
import MobileMenu from "./MobileMenu";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Guidelines", href: "/guidelines" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((current) => !current);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e2d5]/80 bg-[#faf8f2]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        <div className="flex min-h-[76px] items-center justify-between gap-6">
          {/* Brand */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-3"
            aria-label="Bajim Blossom Kitchen & Household Items home"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#30483a] text-sm font-bold text-white shadow-sm"
              aria-hidden="true"
            >
              BB
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-[#26332b] sm:text-base">
                Bajim Blossom
              </p>

              <p className="hidden text-[11px] leading-tight text-[#687069] sm:block">
                Kitchen &amp; Household Items
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="Main navigation"
          >
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#4f5952] transition hover:text-[#30483a]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#30483a] transition hover:bg-[#edf2e9]"
            >
              Login
            </Link>

            <Link
              href="/join"
              className="rounded-full bg-[#30483a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263a2f]"
            >
              Join the Thrift
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-public-navigation"
            aria-label={
              isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#d9ded5] bg-white text-[#30483a] transition hover:bg-[#f2f5ef] lg:hidden"
          >
            <span className="sr-only">
              {isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"}
            </span>

            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span
                className={`block h-0.5 w-5 bg-current transition ${
                  isMobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-current transition ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-current transition ${
                  isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-public-navigation">
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />
      </div>
    </header>
  );
}
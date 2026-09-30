"use client";

import Link from "next/link";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Guidelines", href: "/guidelines" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function MobileMenu({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="border-t border-[#e7e2d5] bg-[#faf8f2] lg:hidden">
      <div className="mx-auto max-w-6xl px-6 py-5 sm:px-8">
        <nav aria-label="Mobile navigation">
          <div className="flex flex-col">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="border-b border-[#e7e2d5] py-4 text-sm font-medium text-[#3f4942] transition hover:text-[#30483a]"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/join"
              onClick={onClose}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#30483a] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f]"
            >
              Join the Thrift
            </Link>

            <Link
              href="/login"
              onClick={onClose}
              className="mt-3 inline-flex items-center justify-center rounded-full border border-[#cbd4c7] bg-white px-5 py-3.5 text-sm font-semibold text-[#30483a] transition hover:bg-[#f3f5f0]"
            >
              Member Login
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
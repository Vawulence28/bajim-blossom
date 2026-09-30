"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { memberNavigation } from "./memberNavigation";

export default function MemberMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActiveRoute = (href) => {
    if (href === "/member") {
      return pathname === "/member";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-stone-200 bg-white lg:hidden">
      {/* Mobile header */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/member" onClick={() => setOpen(false)}>
          <div className="text-base font-bold tracking-tight text-slate-900">
            BAJIM BLOSSOM
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Member Portal
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="member-mobile-menu"
          aria-label={open ? "Close member menu" : "Open member menu"}
          className="rounded-lg border border-stone-200 p-2 text-slate-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <span
            aria-hidden="true"
            className="text-xl leading-none"
          >
            {open ? "×" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          id="member-mobile-menu"
          aria-label="Member navigation"
          className="border-t border-stone-200 bg-white px-4 py-3 sm:px-6"
        >
          <div className="space-y-1">
            {memberNavigation.map((item) => {
              const active = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-stone-50 hover:text-emerald-700"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                      active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-slate-500"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="my-2 border-t border-stone-200" />

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-stone-50"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100"
              >
                ←
              </span>

              <span>Back to Website</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
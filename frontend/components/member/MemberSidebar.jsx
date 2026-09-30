"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memberNavigation } from "./memberNavigation";

export default function MemberSidebar() {
  const pathname = usePathname();

  const isActiveRoute = (href) => {
    if (href === "/member") {
      return pathname === "/member";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:flex lg:flex-col">
      {/* Brand */}
      <div className="border-b border-stone-200 px-6 py-6">
        <Link href="/" className="block">
          <div className="text-lg font-bold tracking-tight text-slate-900">
            BAJIM BLOSSOM
          </div>

          <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
            Member Portal
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Member navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        {memberNavigation.map((item) => {
          const active = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:bg-stone-50 hover:text-slate-900"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition ${
                  active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-100 text-slate-500 group-hover:bg-stone-200"
                }`}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-stone-200 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-stone-50 hover:text-slate-900"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-slate-500"
          >
            ←
          </span>

          <span>Back to Website</span>
        </Link>
      </div>
    </aside>
  );
}
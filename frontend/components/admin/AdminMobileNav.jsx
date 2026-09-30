"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "./adminNavigation";

export default function AdminMobileNav() {
    const pathname = usePathname();

    return (
        <header className="border-b border-white/10 bg-slate-950 lg:hidden">
            {/* Mobile / Tablet Header */}
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-5 md:px-6">
                <Link
                    href="/admin"
                    className="min-w-0 rounded-lg"
                    aria-label="BAJIM Blossom Admin Dashboard"
                >
                    <div className="truncate text-base font-bold leading-5 text-white sm:text-lg">
                        BAJIM BLOSSOM
                    </div>

                    <div className="mt-0.5 text-[11px] font-medium text-slate-400 sm:text-xs">
                        Administration
                    </div>
                </Link>

                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:px-3 sm:text-xs">
                    Admin
                </span>
            </div>

            {/* Horizontal Navigation */}
            <div className="border-t border-white/10">
                <nav
                    aria-label="Mobile administration navigation"
                    className="flex min-w-max gap-1 overflow-x-auto px-3 py-2.5 sm:px-4 md:px-5"
                >
                    {adminNavigation.map((item) => {
                        const isActive =
                            item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname === item.href ||
                                  pathname.startsWith(
                                      `${item.href}/`
                                  );

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={
                                    isActive
                                        ? "page"
                                        : undefined
                                }
                                className={`flex min-h-10 shrink-0 items-center rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                                    isActive
                                        ? "bg-emerald-700 text-white shadow-sm"
                                        : "text-slate-200 hover:bg-white/10 hover:text-white active:bg-white/15"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
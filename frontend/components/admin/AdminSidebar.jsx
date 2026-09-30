"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "./adminNavigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-slate-950 lg:flex">
            {/* Brand */}
            <div className="shrink-0 border-b border-white/10 px-5 py-5 xl:px-6 xl:py-6">
                <Link
                    href="/admin"
                    className="block rounded-lg"
                >
                    <div className="break-words text-base font-bold leading-5 text-white xl:text-lg">
                        BAJIM BLOSSOM
                    </div>

                    <div className="mt-1 text-xs font-medium text-white/70">
                        Administration
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav
                aria-label="Administration navigation"
                className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4 xl:px-3 xl:py-5"
            >
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 xl:text-xs xl:tracking-wider">
                    Administration
                </p>

                <div className="space-y-1">
                    {adminNavigation.map(
                        (item) => {
                            const isActive =
                                item.href ===
                                "/admin"
                                    ? pathname ===
                                      "/admin"
                                    : pathname ===
                                          item.href ||
                                      pathname.startsWith(
                                          `${item.href}/`
                                      );

                            return (
                                <Link
                                    key={
                                        item.href
                                    }
                                    href={
                                        item.href
                                    }
                                    className={`block min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-emerald-700 text-white"
                                            : "text-white hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        }
                    )}
                </div>
            </nav>

            {/* Bottom Links */}
            <div className="shrink-0 border-t border-white/10 p-2.5 xl:p-3">
                <Link
                    href="/"
                    className="block min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                    Public Website
                </Link>

                <Link
                    href="/login"
                    className="mt-1 block min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                    Logout
                </Link>
            </div>
        </aside>
    );
}
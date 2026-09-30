"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { adminNavigation } from "./adminNavigation";

export default function AdminMobileNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    function closeMenu() {
        setIsOpen(false);
    }

    return (
        <header className="border-b border-white/10 bg-slate-950 lg:hidden">
            {/* Mobile Header */}
            <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-6">
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

                <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:px-3 sm:text-xs">
                        Admin
                    </span>

                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        aria-label="Open administration menu"
                        aria-expanded={isOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 active:bg-white/15"
                    >
                        <span
                            aria-hidden="true"
                            className="text-xl leading-none"
                        >
                            ☰
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Administration navigation"
                >
                    {/* Overlay */}
                    <button
                        type="button"
                        aria-label="Close administration menu"
                        onClick={closeMenu}
                        className="absolute inset-0 bg-black/60"
                    />

                    {/* Drawer */}
                    <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,20rem)] max-w-full flex-col border-r border-white/10 bg-slate-950 shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
                            <div>
                                <div className="text-base font-bold leading-5 text-white">
                                    BAJIM BLOSSOM
                                </div>

                                <div className="mt-1 text-xs font-medium text-slate-400">
                                    Administration
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeMenu}
                                aria-label="Close administration menu"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xl text-white transition-colors hover:bg-white/10 active:bg-white/15"
                            >
                                <span aria-hidden="true">
                                    ×
                                </span>
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav
                            aria-label="Mobile administration navigation"
                            className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
                        >
                            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                                Administration
                            </p>

                            <div className="space-y-1">
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
                                            onClick={closeMenu}
                                            aria-current={
                                                isActive
                                                    ? "page"
                                                    : undefined
                                            }
                                            className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? "bg-emerald-700 text-white"
                                                    : "text-slate-200 hover:bg-white/10 hover:text-white active:bg-white/15"
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Bottom Links */}
                        <div className="shrink-0 border-t border-white/10 p-3">
                            <Link
                                href="/"
                                onClick={closeMenu}
                                className="block min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                Public Website
                            </Link>

                            <Link
                                href="/login"
                                onClick={closeMenu}
                                className="mt-1 block min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                Logout
                            </Link>
                        </div>
                    </aside>
                </div>
            )}
        </header>
    );
}

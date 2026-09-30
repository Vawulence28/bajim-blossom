"use client";

import { useEffect, useState } from "react";

import { getAdminDashboard } from "../../services/adminApi";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminMobileNav from "../../components/admin/AdminMobileNav";

function formatCurrency(value) {
    return `₦${Number(value || 0).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getStatusClasses(status) {
    const normalizedStatus = String(
        status || ""
    ).toUpperCase();

    if (
        normalizedStatus === "ACTIVE" ||
        normalizedStatus === "VERIFIED" ||
        normalizedStatus === "PAID" ||
        normalizedStatus === "OPEN"
    ) {
        return "bg-[#eef7ef] text-[#356044]";
    }

    if (
        normalizedStatus === "PENDING" ||
        normalizedStatus === "PENDING_APPROVAL" ||
        normalizedStatus === "PROCESSING"
    ) {
        return "bg-[#fff7e8] text-[#8a641f]";
    }

    if (
        normalizedStatus === "INACTIVE" ||
        normalizedStatus === "CLOSED" ||
        normalizedStatus === "REJECTED" ||
        normalizedStatus === "FAILED"
    ) {
        return "bg-[#fff1ef] text-[#8a4036]";
    }

    return "bg-[#f1f3ef] text-[#58615b]";
}

function StatCard({
    label,
    value,
    description
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-white p-4 shadow-[0_10px_30px_rgba(38,51,43,0.04)] sm:p-5 lg:p-6">
            <p className="text-xs font-medium leading-5 text-[#687069] sm:text-sm">
                {label}
            </p>

            <p className="mt-2 break-words text-2xl font-bold leading-tight text-[#26332b] sm:mt-3 sm:text-3xl">
                {value}
            </p>

            {description && (
                <p className="mt-2 text-[11px] leading-5 text-[#8a918c] sm:text-xs">
                    {description}
                </p>
            )}
        </div>
    );
}

function SectionHeader({
    title,
    description
}) {
    return (
        <div className="border-b border-[#eee9dd] px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-sm font-bold text-[#26332b] sm:text-base">
                {title}
            </h2>

            {description && (
                <p className="mt-1 text-[11px] leading-5 text-[#8a918c] sm:text-xs">
                    {description}
                </p>
            )}
        </div>
    );
}

function EmptyState({ children }) {
    return (
        <div className="px-4 py-10 text-center text-sm leading-6 text-[#8a918c] sm:px-6">
            {children}
        </div>
    );
}

export default function AdminDashboardPage() {
    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        let mounted = true;

        async function loadDashboard() {
            try {
                setLoading(true);
                setErrorMessage("");

                const response =
                    await getAdminDashboard();

                if (!mounted) {
                    return;
                }

                setDashboard(
                    response?.data || null
                );
            } catch (error) {
                console.error(
                    "Admin dashboard error:",
                    error
                );

                if (mounted) {
                    setErrorMessage(
                        error?.data?.message ||
                            error?.message ||
                            "Unable to load the admin dashboard."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
            {/* Desktop sidebar */}
            <AdminSidebar />

            {/* Main application area */}
            <div className="min-h-screen min-w-0 lg:pl-64">
                {/* Mobile/tablet navigation */}
                <div className="lg:hidden">
                    <AdminMobileNav />
                </div>

                <main className="px-3 py-5 sm:px-5 sm:py-7 md:px-6 md:py-8 lg:px-8 lg:py-10">
                    <div className="mx-auto w-full max-w-7xl min-w-0">
                        {/* Page heading */}
                        <header>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8066] sm:text-xs sm:tracking-[0.2em]">
                                Administration
                            </p>

                            <h1 className="mt-1.5 text-2xl font-bold leading-tight text-[#26332b] sm:mt-2 sm:text-3xl md:text-4xl">
                                Dashboard
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687069] sm:mt-3 sm:leading-7">
                                Manage members,
                                contribution cycles,
                                payments, fines and
                                other BAJIM BLOSSOM
                                operations from one
                                place.
                            </p>
                        </header>

                        {/* Loading state */}
                        {loading && (
                            <>
                                <section className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                                    {Array.from({
                                        length: 8
                                    }).map(
                                        (_, index) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="animate-pulse rounded-2xl border border-[#e7e2d5] bg-white p-4 sm:p-6"
                                            >
                                                <div className="h-4 w-28 rounded bg-[#eee9dd]" />

                                                <div className="mt-4 h-8 w-20 rounded bg-[#eee9dd] sm:h-9" />

                                                <div className="mt-3 h-3 w-36 rounded bg-[#f2eee5]" />
                                            </div>
                                        )
                                    )}
                                </section>
                            </>
                        )}

                        {/* Error state */}
                        {errorMessage &&
                            !loading && (
                                <div className="mt-6 rounded-2xl border border-[#ead0cc] bg-[#fff5f3] p-4 sm:mt-8 sm:p-6">
                                    <p className="text-sm font-semibold text-[#8a4036]">
                                        Dashboard could
                                        not be loaded.
                                    </p>

                                    <p className="mt-2 break-words text-sm leading-6 text-[#8a4036]">
                                        {errorMessage}
                                    </p>
                                </div>
                            )}

                        {/* Dashboard content */}
                        {dashboard &&
                            !loading &&
                            !errorMessage && (
                                <>
                                    {/* Member and cycle statistics */}
                                    <section className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                                        <StatCard
                                            label="Total Members"
                                            value={
                                                dashboard
                                                    .members
                                                    ?.total ||
                                                0
                                            }
                                            description="Registered member accounts"
                                        />

                                        <StatCard
                                            label="Pending Applications"
                                            value={
                                                dashboard
                                                    .members
                                                    ?.pending ||
                                                0
                                            }
                                            description="Awaiting approval"
                                        />

                                        <StatCard
                                            label="Active Members"
                                            value={
                                                dashboard
                                                    .members
                                                    ?.active ||
                                                0
                                            }
                                            description="Currently active"
                                        />

                                        <StatCard
                                            label="Open Cycles"
                                            value={
                                                dashboard
                                                    .cycles
                                                    ?.open ||
                                                0
                                            }
                                            description="Currently accepting contributions"
                                        />
                                    </section>

                                    {/* Contribution and fine statistics */}
                                    <section className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                                        <StatCard
                                            label="Outstanding Contributions"
                                            value={
                                                dashboard
                                                    .contributions
                                                    ?.outstanding ||
                                                0
                                            }
                                            description="Contribution records requiring attention"
                                        />

                                        <StatCard
                                            label="Outstanding Amount"
                                            value={formatCurrency(
                                                dashboard
                                                    .contributions
                                                    ?.outstanding_amount
                                            )}
                                            description="Expected contribution amount"
                                        />

                                        <StatCard
                                            label="Outstanding Fines"
                                            value={
                                                dashboard
                                                    .fines
                                                    ?.outstanding_count ||
                                                0
                                            }
                                            description="Unpaid fines"
                                        />

                                        <StatCard
                                            label="Outstanding Fine Amount"
                                            value={formatCurrency(
                                                dashboard
                                                    .fines
                                                    ?.outstanding_amount
                                            )}
                                            description="Current outstanding fines"
                                        />
                                    </section>

                                    {/* Recent activity */}
                                    <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 xl:grid-cols-2">
                                        {/* Recent members */}
                                        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e7e2d5] bg-white shadow-[0_10px_30px_rgba(38,51,43,0.03)]">
                                            <SectionHeader
                                                title="Recent Members"
                                                description="Latest member registrations from the database"
                                            />

                                            <div className="divide-y divide-[#eee9dd]">
                                                {dashboard
                                                    .recentMembers
                                                    ?.length ? (
                                                    dashboard.recentMembers.map(
                                                        (
                                                            member
                                                        ) => (
                                                            <div
                                                                key={
                                                                    member.id
                                                                }
                                                                className="px-4 py-4 sm:px-6 sm:py-5"
                                                            >
                                                                <div className="flex min-w-0 items-start justify-between gap-3">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="break-words text-sm font-semibold leading-5 text-[#26332b]">
                                                                            {
                                                                                member.full_name
                                                                            }
                                                                        </p>

                                                                        {member.email && (
                                                                            <p className="mt-1 break-anywhere text-xs leading-5 text-[#687069]">
                                                                                {
                                                                                    member.email
                                                                                }
                                                                            </p>
                                                                        )}

                                                                        {member.member_id && (
                                                                            <p className="mt-1 break-anywhere text-xs font-medium leading-5 text-[#8a918c]">
                                                                                {
                                                                                    member.member_id
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <span
                                                                        className={`max-w-[42%] shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] font-semibold leading-4 sm:px-3 sm:text-[11px] ${getStatusClasses(
                                                                            member.status
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            member.status
                                                                        }
                                                                    </span>
                                                                </div>

                                                                {member.created_at && (
                                                                    <p className="mt-3 text-[11px] leading-4 text-[#9a9f9b]">
                                                                        Registered{" "}
                                                                        {formatDate(
                                                                            member.created_at
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <EmptyState>
                                                        No members
                                                        have been
                                                        registered
                                                        yet.
                                                    </EmptyState>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent payments */}
                                        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e7e2d5] bg-white shadow-[0_10px_30px_rgba(38,51,43,0.03)]">
                                            <SectionHeader
                                                title="Recent Payments"
                                                description="Latest payment records from the database"
                                            />

                                            <div className="divide-y divide-[#eee9dd]">
                                                {dashboard
                                                    .recentPayments
                                                    ?.length ? (
                                                    dashboard.recentPayments.map(
                                                        (
                                                            payment
                                                        ) => (
                                                            <div
                                                                key={
                                                                    payment.id
                                                                }
                                                                className="px-4 py-4 sm:px-6 sm:py-5"
                                                            >
                                                                <div className="flex min-w-0 items-start justify-between gap-3">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="break-words text-sm font-semibold leading-5 text-[#26332b]">
                                                                            {
                                                                                payment.full_name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 break-words text-xs leading-5 text-[#687069]">
                                                                            {payment.payment_method ||
                                                                                payment.method ||
                                                                                "Payment"}

                                                                            {" · "}

                                                                            {formatCurrency(
                                                                                payment.amount
                                                                            )}
                                                                        </p>

                                                                        {payment.payment_reference && (
                                                                            <p className="mt-1 break-anywhere text-xs leading-5 text-[#8a918c]">
                                                                                Ref:{" "}
                                                                                {
                                                                                    payment.payment_reference
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <span
                                                                        className={`max-w-[42%] shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] font-semibold leading-4 sm:px-3 sm:text-[11px] ${getStatusClasses(
                                                                            payment.payment_status ||
                                                                                payment.status
                                                                        )}`}
                                                                    >
                                                                        {payment.payment_status ||
                                                                            payment.status}
                                                                    </span>
                                                                </div>

                                                                {payment.paid_at && (
                                                                    <p className="mt-3 text-[11px] leading-4 text-[#9a9f9b]">
                                                                        Paid{" "}
                                                                        {formatDate(
                                                                            payment.paid_at
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <EmptyState>
                                                        No payment
                                                        records have
                                                        been created
                                                        yet.
                                                    </EmptyState>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                    </div>
                </main>
            </div>
        </div>
    );
}
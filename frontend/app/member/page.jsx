"use client";

import { useEffect, useState } from "react";

import {
    getMemberDashboard
} from "../../services/memberApi.js";

import MemberLoadingState from "../../components/member/MemberLoadingState";
import MemberEmptyState from "../../components/member/MemberEmptyState";
import MemberErrorState from "../../components/member/MemberErrorState";

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2
    }).format(Number(amount || 0));
}

function formatDate(value) {
    if (!value) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium"
    }).format(new Date(value));
}

function statusLabel(status) {
    if (!status) {
        return "Not available";
    }

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (letter) => letter.toUpperCase()
        );
}

export default function MemberDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getMemberDashboard();

                if (active) {
                    setData(response.data);
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message ||
                            "Unable to load your dashboard."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <MemberLoadingState />;
    }

    if (error) {
        return (
            <MemberErrorState
                message={error}
            />
        );
    }

    if (!data) {
        return (
            <MemberEmptyState
                title="Dashboard unavailable"
                message="Your member dashboard could not be loaded."
            />
        );
    }

    const {
        member,
        currentCycle,
        currentContribution,
        recentContributions,
        latestAnnouncement
    } = data;

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Welcome Header */}
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                    Welcome back
                </p>

                <h1 className="mt-1 break-words text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                    {member.fullName}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-1">
                    Here is an overview of your membership.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Member ID
                    </p>

                    <p className="mt-2 break-all font-semibold text-slate-900">
                        {member.memberId ||
                            "Not assigned"}
                    </p>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Membership
                    </p>

                    <p className="mt-2 break-words font-semibold text-slate-900">
                        {statusLabel(member.status)}
                    </p>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Current Contribution
                    </p>

                    <p className="mt-2 break-words font-semibold text-slate-900">
                        {currentContribution
                            ? formatCurrency(
                                currentContribution.amountPaid
                            )
                            : "No record"}
                    </p>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Outstanding
                    </p>

                    <p className="mt-2 break-words font-semibold text-slate-900">
                        {currentContribution
                            ? formatCurrency(
                                currentContribution.totalOutstanding
                            )
                            : formatCurrency(0)}
                    </p>
                </div>
            </div>

            {/* Current Contribution Cycle */}
            {currentCycle && (
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm text-slate-500">
                                Current contribution cycle
                            </p>

                            <h2 className="mt-1 break-words text-lg font-semibold leading-7 text-slate-900 sm:text-xl">
                                {currentCycle.name}
                            </h2>
                        </div>

                        <div className="w-fit max-w-full shrink-0 break-words rounded-full bg-slate-100 px-3 py-1 text-xs font-medium leading-5 text-slate-700">
                            {statusLabel(
                                currentCycle.status
                            )}
                        </div>
                    </div>

                    <div className="mt-5 grid min-w-0 gap-4 sm:mt-6 sm:grid-cols-3 sm:gap-5">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Amount
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatCurrency(
                                    currentCycle.contributionAmount
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Due
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatDate(
                                    currentCycle.dueAt
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Grace Until
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatDate(
                                    currentCycle.graceUntil
                                )}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Current Contribution */}
            {currentContribution && (
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                        Current Contribution
                    </h2>

                    <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-3 sm:gap-5">
                        <div className="min-w-0">
                            <p className="text-sm text-slate-500">
                                Expected
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    currentContribution.expectedAmount
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm text-slate-500">
                                Paid
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    currentContribution.amountPaid
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm text-slate-500">
                                Outstanding
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    currentContribution.totalOutstanding
                                )}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Recent Contributions */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                    Recent Contributions
                </h2>

                {recentContributions?.length > 0 ? (
                    <div className="mt-4 divide-y divide-slate-100 sm:mt-5">
                        {recentContributions.map(
                            (contribution) => (
                                <div
                                    key={contribution.id}
                                    className="flex min-w-0 flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-5"
                                >
                                    <div className="min-w-0">
                                        <p className="break-words font-medium text-slate-900">
                                            {
                                                contribution.cycleName
                                            }
                                        </p>

                                        <p className="mt-1 break-words text-sm text-slate-500">
                                            Due{" "}
                                            {formatDate(
                                                contribution.dueAt
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0 text-left sm:shrink-0 sm:text-right">
                                        <p className="break-words font-medium text-slate-900">
                                            {formatCurrency(
                                                contribution.amountPaid
                                            )}
                                        </p>

                                        <p className="mt-1 break-words text-sm text-slate-500">
                                            {statusLabel(
                                                contribution.status
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <p className="mt-4 text-sm leading-6 text-slate-500">
                        No contribution records are available yet.
                    </p>
                )}
            </section>

            {/* Latest Announcement */}
            {latestAnnouncement && (
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <p className="text-sm font-medium text-slate-500">
                        Latest Announcement
                    </p>

                    <h2 className="mt-1 break-words text-base font-semibold leading-7 text-slate-900 sm:text-lg">
                        {latestAnnouncement.title}
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                        {latestAnnouncement.content}
                    </p>

                    <p className="mt-4 break-words text-xs text-slate-500">
                        Published{" "}
                        {formatDate(
                            latestAnnouncement.publishedAt
                        )}
                    </p>
                </section>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";

import {
    getMemberStatus
} from "../../../services/memberApi.js";

import MemberLoadingState from "../../../components/member/MemberLoadingState";
import MemberEmptyState from "../../../components/member/MemberEmptyState";
import MemberErrorState from "../../../components/member/MemberErrorState";

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
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MemberStatusPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadStatus() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getMemberStatus();

                if (active) {
                    setData(response.data);
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message ||
                            "Unable to load your membership status."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadStatus();

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
                title="Status unavailable"
                message="Your membership status is not currently available."
            />
        );
    }

    const {
        member,
        currentCycle,
        contribution,
        groupPayment
    } = data;

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Page Header */}
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                    My Status
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-1">
                    View your membership and current contribution status.
                </p>
            </div>

            {/* Membership Status */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-slate-500">
                            Membership status
                        </p>

                        <h2 className="mt-1 break-words text-lg font-semibold leading-7 text-slate-900 sm:text-xl">
                            {statusLabel(
                                member.membershipStatus
                            )}
                        </h2>
                    </div>

                    <div className="w-fit max-w-full shrink-0 break-words rounded-full bg-slate-100 px-4 py-2 text-sm font-medium leading-5 text-slate-700">
                        {statusLabel(member.role)}
                    </div>
                </div>

                <div className="mt-5 grid min-w-0 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Member ID
                        </p>

                        <p className="mt-1 break-all font-medium text-slate-900">
                            {member.memberId ||
                                "Not assigned"}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Joined
                        </p>

                        <p className="mt-1 break-words font-medium text-slate-900">
                            {formatDate(
                                member.joinedAt
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* Current Contribution Cycle */}
            {currentCycle ? (
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                        Current Contribution Cycle
                    </h2>

                    <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Cycle
                            </p>

                            <p className="mt-1 break-words font-medium leading-6 text-slate-900">
                                {currentCycle.name}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Contribution
                            </p>

                            <p className="mt-1 break-words font-medium text-slate-900">
                                {formatCurrency(
                                    currentCycle.contributionAmount
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Due
                            </p>

                            <p className="mt-1 break-words font-medium text-slate-900">
                                {formatDate(
                                    currentCycle.dueAt
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Grace Until
                            </p>

                            <p className="mt-1 break-words font-medium text-slate-900">
                                {formatDate(
                                    currentCycle.graceUntil
                                )}
                            </p>
                        </div>
                    </div>
                </section>
            ) : (
                <MemberEmptyState
                    title="No active contribution cycle"
                    message="There is currently no open contribution cycle."
                />
            )}

            {/* Current Contribution */}
            {contribution && (
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                        Your Current Contribution
                    </h2>

                    <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Expected
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    contribution.expectedAmount
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Paid
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    contribution.amountPaid
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Outstanding
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    contribution.outstandingContribution
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Fine
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                                {formatCurrency(
                                    contribution.outstandingFine
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-5">
                        <p className="text-sm text-slate-500">
                            Contribution status
                        </p>

                        <p className="mt-1 break-words font-medium text-slate-900">
                            {statusLabel(
                                contribution.status
                            )}
                        </p>
                    </div>
                </section>
            )}

            {/* Group Payment */}
            {groupPayment && (
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                        Group Payment Status
                    </h2>

                    <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-3 sm:gap-5">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Active Members
                            </p>

                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {groupPayment.totalMembers}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Paid
                            </p>

                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {groupPayment.paidMembers}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Not Yet Paid
                            </p>

                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {groupPayment.unpaidMembers}
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

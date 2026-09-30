"use client";

import { useEffect, useState } from "react";

import {
    getMemberContributions
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

export default function MemberContributionsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadContributions() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getMemberContributions();

                if (active) {
                    setData(response.data);
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message ||
                            "Unable to load your contributions."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadContributions();

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
                title="Contribution information unavailable"
                message="Your contribution information could not be loaded."
            />
        );
    }

    const {
        summary,
        currentContribution,
        history
    } = data;

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Page Header */}
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                    My Contributions
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-1">
                    View your contribution records, payments and fines.
                </p>
            </div>

            {/* Summary Cards */}
            <section className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Contributions
                    </p>

                    <p className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                        {summary.totalContributions}
                    </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Total Expected
                    </p>

                    <p className="mt-2 break-words text-xl font-semibold text-slate-900 sm:text-2xl">
                        {formatCurrency(
                            summary.totalExpectedAmount
                        )}
                    </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Total Paid
                    </p>

                    <p className="mt-2 break-words text-xl font-semibold text-slate-900 sm:text-2xl">
                        {formatCurrency(
                            summary.totalPaidAmount
                        )}
                    </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="text-sm text-slate-500">
                        Outstanding
                    </p>

                    <p className="mt-2 break-words text-xl font-semibold text-slate-900 sm:text-2xl">
                        {formatCurrency(
                            summary.totalOutstanding
                        )}
                    </p>
                </div>
            </section>

            {/* Current Contribution */}
            {currentContribution && (
                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                        <div className="min-w-0">
                            <p className="text-sm text-slate-500">
                                Current Cycle
                            </p>

                            <h2 className="mt-1 break-words text-lg font-semibold leading-7 text-slate-900 sm:text-xl">
                                {currentContribution.cycle.name}
                            </h2>
                        </div>

                        <span className="w-fit max-w-full shrink-0 break-words rounded-full bg-slate-100 px-3 py-1 text-xs font-medium leading-5 text-slate-700">
                            {statusLabel(
                                currentContribution.status
                            )}
                        </span>
                    </div>

                    <div className="mt-5 grid min-w-0 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-5">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Expected
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatCurrency(
                                    currentContribution.expectedAmount
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Paid
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatCurrency(
                                    currentContribution.amountPaid
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Outstanding
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatCurrency(
                                    currentContribution.outstandingContribution
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Fine
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatCurrency(
                                    currentContribution.outstandingFine
                                )}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Due
                            </p>

                            <p className="mt-1 break-words font-semibold text-slate-900">
                                {formatDate(
                                    currentContribution.cycle.dueAt
                                )}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Contribution History */}
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                    Contribution History
                </h2>

                {history?.length > 0 ? (
                    <>
                        {/* Desktop / Tablet Table */}
                        <div className="mt-5 hidden overflow-x-auto lg:block">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                        <th className="whitespace-nowrap px-3 py-3">
                                            Cycle
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-3">
                                            Expected
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-3">
                                            Paid
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-3">
                                            Outstanding
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-3">
                                            Status
                                        </th>

                                        <th className="whitespace-nowrap px-3 py-3">
                                            Due
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.map(
                                        (contribution) => (
                                            <tr
                                                key={contribution.id}
                                                className="border-b border-slate-100 last:border-0"
                                            >
                                                <td className="max-w-56 px-3 py-4 font-medium text-slate-900">
                                                    <span className="break-words">
                                                        {
                                                            contribution
                                                                .cycle
                                                                .name
                                                        }
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                                                    {formatCurrency(
                                                        contribution.expectedAmount
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                                                    {formatCurrency(
                                                        contribution.amountPaid
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                                                    {formatCurrency(
                                                        contribution.totalOutstanding
                                                    )}
                                                </td>

                                                <td className="px-3 py-4 text-slate-700">
                                                    {statusLabel(
                                                        contribution.status
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                                                    {formatDate(
                                                        contribution
                                                            .cycle
                                                            .dueAt
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile / Tablet Cards */}
                        <div className="mt-4 space-y-3 lg:hidden">
                            {history.map(
                                (contribution) => (
                                    <article
                                        key={contribution.id}
                                        className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    Cycle
                                                </p>

                                                <h3 className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900 sm:text-base">
                                                    {
                                                        contribution
                                                            .cycle
                                                            .name
                                                    }
                                                </h3>
                                            </div>

                                            <span className="w-fit max-w-full shrink-0 break-words rounded-full bg-white px-3 py-1 text-xs font-medium leading-5 text-slate-700 ring-1 ring-slate-200">
                                                {statusLabel(
                                                    contribution.status
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500">
                                                    Expected
                                                </p>

                                                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                                                    {formatCurrency(
                                                        contribution.expectedAmount
                                                    )}
                                                </p>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500">
                                                    Paid
                                                </p>

                                                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                                                    {formatCurrency(
                                                        contribution.amountPaid
                                                    )}
                                                </p>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500">
                                                    Outstanding
                                                </p>

                                                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                                                    {formatCurrency(
                                                        contribution.totalOutstanding
                                                    )}
                                                </p>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500">
                                                    Due
                                                </p>

                                                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                                                    {formatDate(
                                                        contribution
                                                            .cycle
                                                            .dueAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    </>
                ) : (
                    <p className="mt-4 text-sm leading-6 text-slate-500">
                        No contribution records are available yet.
                    </p>
                )}
            </section>
        </div>
    );
}

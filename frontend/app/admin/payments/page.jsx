"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getAdminPayments,
    getAdminPayment,
    getAdminPaymentContributions,
    createAdminPayment,
    updateAdminPaymentStatus
} from "../../../services/adminApi";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

function formatCurrency(value) {
    const amount = Number(value || 0);

    return `₦${amount.toLocaleString("en-NG", {
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
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getStatusClasses(status) {
    switch (status) {
        case "VERIFIED":
            return "bg-emerald-100 text-emerald-800";

        case "PENDING":
            return "bg-amber-100 text-amber-800";

        case "REJECTED":
            return "bg-red-100 text-red-800";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getContributionStatusClasses(status) {
    switch (status) {
        case "PAID":
            return "bg-emerald-100 text-emerald-800";

        case "PENDING":
            return "bg-amber-100 text-amber-800";

        case "OVERDUE":
            return "bg-red-100 text-red-800";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function formatPaymentMethod(method) {
    switch (method) {
        case "BANK_TRANSFER":
            return "Bank Transfer";

        case "CASH":
            return "Cash";

        default:
            return method || "—";
    }
}

function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] =
        useState([]);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
        });

    const [search, setSearch] =
        useState("");

    const [searchInput, setSearchInput] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("");

    const [methodFilter, setMethodFilter] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showRecordModal, setShowRecordModal] =
        useState(false);

    const [showDetailsModal, setShowDetailsModal] =
        useState(false);

    const [selectedPayment, setSelectedPayment] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [detailsError, setDetailsError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [actionError, setActionError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [contributions, setContributions] =
        useState([]);

    const [contributionsLoading, setContributionsLoading] =
        useState(false);

    const [contributionSearch, setContributionSearch] =
        useState("");

    const [form, setForm] =
        useState({
            contributionId: "",
            amount: "",
            paymentMethod: "CASH",
            paymentReference: "",
            paidAt: getTodayDate(),
            notes: ""
        });

    const [formError, setFormError] =
        useState("");

    const loadPayments = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getAdminPayments({
                        search,
                        status: statusFilter,
                        method: methodFilter,
                        page,
                        limit: 20
                    });

                setPayments(
                    response?.data?.payments ||
                        []
                );

                setPagination(
                    response?.data?.pagination ||
                        {
                            page,
                            limit: 20,
                            total: 0,
                            totalPages: 0,
                            hasNextPage: false,
                            hasPreviousPage: false
                        }
                );
            } catch (err) {
                console.error(
                    "Failed to load payments:",
                    err
                );

                setError(
                    err?.message ||
                        "Unable to load payment records."
                );
            } finally {
                setLoading(false);
            }
        },
        [
            search,
            statusFilter,
            methodFilter
        ]
    );

    const loadContributions =
        useCallback(async () => {
            try {
                setContributionsLoading(
                    true
                );

                const response =
                    await getAdminPaymentContributions(
                        {
                            search:
                                contributionSearch,
                            limit: 100
                        }
                    );

                setContributions(
                    response?.data || []
                );
            } catch (err) {
                console.error(
                    "Failed to load contributions:",
                    err
                );

                setFormError(
                    err?.message ||
                        "Unable to load available contributions."
                );
            } finally {
                setContributionsLoading(
                    false
                );
            }
        }, [
            contributionSearch
        ]);

    useEffect(() => {
        const timer =
            setTimeout(() => {
                loadPayments(1);
            }, 0);

        return () =>
            clearTimeout(timer);
    }, [loadPayments]);

    useEffect(() => {
        if (!showRecordModal) {
            return;
        }

        const timer =
            setTimeout(() => {
                loadContributions();
            }, 0);

        return () =>
            clearTimeout(timer);
    }, [
        showRecordModal,
        loadContributions
    ]);

    function handleSearchSubmit(
        event
    ) {
        event.preventDefault();

        setSearch(
            searchInput.trim()
        );
    }

    function handleStatusChange(
        event
    ) {
        setStatusFilter(
            event.target.value
        );
    }

    function handleMethodChange(
        event
    ) {
        setMethodFilter(
            event.target.value
        );
    }

    function openRecordModal() {
        setForm({
            contributionId: "",
            amount: "",
            paymentMethod: "CASH",
            paymentReference: "",
            paidAt: getTodayDate(),
            notes: ""
        });

        setFormError("");
        setActionError("");
        setSuccessMessage("");
        setContributionSearch("");
        setShowRecordModal(true);
    }

    function closeRecordModal() {
        if (submitting) {
            return;
        }

        setShowRecordModal(false);
        setFormError("");
    }

    async function openPaymentDetails(
        paymentId
    ) {
        try {
            setShowDetailsModal(true);
            setDetailsLoading(true);
            setDetailsError("");
            setSelectedPayment(null);

            const response =
                await getAdminPayment(
                    paymentId
                );

            setSelectedPayment(
                response?.data || null
            );
        } catch (err) {
            console.error(
                "Failed to load payment:",
                err
            );

            setDetailsError(
                err?.message ||
                    "Unable to load payment details."
            );
        } finally {
            setDetailsLoading(false);
        }
    }

    function closeDetailsModal() {
        if (actionLoading) {
            return;
        }

        setShowDetailsModal(false);
        setSelectedPayment(null);
        setDetailsError("");
        setActionError("");
    }

    function handleFormChange(
        event
    ) {
        const {
            name,
            value
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));

        setFormError("");
    }

    function handleContributionSelect(
        event
    ) {
        const contributionId =
            event.target.value;

        const selected =
            contributions.find(
                (item) =>
                    item.contribution_id ===
                    contributionId
            );

        setForm((current) => ({
            ...current,
            contributionId,
            amount: selected
                ? String(
                      Number(
                          selected.outstanding_amount ||
                              0
                      )
                  )
                : ""
        }));

        setFormError("");
    }

    async function handleRecordPayment(
        event
    ) {
        event.preventDefault();

        setFormError("");
        setSuccessMessage("");

        if (!form.contributionId) {
            setFormError(
                "Please select a contribution."
            );

            return;
        }

        const amount =
            Number(form.amount);

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            setFormError(
                "Please enter a valid payment amount."
            );

            return;
        }

        const selectedContribution =
            contributions.find(
                (item) =>
                    item.contribution_id ===
                    form.contributionId
            );

        if (!selectedContribution) {
            setFormError(
                "The selected contribution could not be found."
            );

            return;
        }

        const outstandingAmount =
            Number(
                selectedContribution.outstanding_amount ||
                    0
            );

        if (amount > outstandingAmount) {
            setFormError(
                `Payment amount cannot exceed the outstanding amount of ${formatCurrency(
                    outstandingAmount
                )}.`
            );

            return;
        }

        try {
            setSubmitting(true);

            await createAdminPayment({
                contributionId:
                    form.contributionId,
                amount,
                paymentMethod:
                    form.paymentMethod,
                paymentReference:
                    form.paymentReference.trim() ||
                    null,
                paidAt:
                    form.paidAt || null,
                notes:
                    form.notes.trim() ||
                    null
            });

            setShowRecordModal(false);

            setSuccessMessage(
                "Payment recorded successfully."
            );

            await loadPayments(
                pagination.page
            );
        } catch (err) {
            console.error(
                "Failed to record payment:",
                err
            );

            setFormError(
                err?.message ||
                    "Unable to record payment."
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handlePaymentStatus(
        status
    ) {
        if (!selectedPayment) {
            return;
        }

        try {
            setActionLoading(true);
            setActionError("");

            await updateAdminPaymentStatus(
                selectedPayment.id,
                status
            );

            const response =
                await getAdminPayment(
                    selectedPayment.id
                );

            setSelectedPayment(
                response?.data || null
            );

            await loadPayments(
                pagination.page
            );

            setSuccessMessage(
                "Payment status updated successfully."
            );
        } catch (err) {
            console.error(
                "Failed to update payment status:",
                err
            );

            setActionError(
                err?.message ||
                    "Unable to update payment status."
            );
        } finally {
            setActionLoading(false);
        }
    }

    function goToPage(page) {
        if (
            page < 1 ||
            page >
                pagination.totalPages
        ) {
            return;
        }

        loadPayments(page);
    }

    const selectedContribution =
        form.contributionId
            ? contributions.find(
                  (item) =>
                      item.contribution_id ===
                      form.contributionId
              )
            : null;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
            <AdminSidebar />

            <div className="min-w-0 lg:pl-64">
                <AdminMobileNav />

                <main className="px-3 pb-8 pt-5 sm:px-5 sm:pb-10 sm:pt-6 md:px-6 lg:px-8 lg:pt-8">
                    <div className="mx-auto w-full max-w-7xl min-w-0">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 sm:text-sm">
                                    Administration
                                </p>

                                <h1 className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                                    Payments
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Record, review and
                                    manage member
                                    contribution
                                    payments.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    openRecordModal
                                }
                                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:w-auto"
                            >
                                + Record Payment
                            </button>
                        </div>

                        {/* Success */}
                        {successMessage && (
                            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-5 text-emerald-800 sm:mt-6">
                                {successMessage}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800 sm:mt-6">
                                {error}
                            </div>
                        )}

                        {/* Filters */}
                        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:mt-6 sm:p-4">
                            <form
                                onSubmit={
                                    handleSearchSubmit
                                }
                                className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]"
                            >
                                <div className="min-w-0">
                                    <label
                                        htmlFor="payment-search"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Search payments
                                    </label>

                                    <input
                                        id="payment-search"
                                        type="text"
                                        value={
                                            searchInput
                                        }
                                        onChange={(event) =>
                                            setSearchInput(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Member, phone, email, ID, reference or cycle"
                                        className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-status"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="payment-status"
                                        value={
                                            statusFilter
                                        }
                                        onChange={
                                            handleStatusChange
                                        }
                                        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="">
                                            All statuses
                                        </option>

                                        <option value="VERIFIED">
                                            Verified
                                        </option>

                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="REJECTED">
                                            Rejected
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-method"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Method
                                    </label>

                                    <select
                                        id="payment-method"
                                        value={
                                            methodFilter
                                        }
                                        onChange={
                                            handleMethodChange
                                        }
                                        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="">
                                            All methods
                                        </option>

                                        <option value="CASH">
                                            Cash
                                        </option>

                                        <option value="BANK_TRANSFER">
                                            Bank Transfer
                                        </option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="min-h-11 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Payment Directory */}
                        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:mt-6">
                            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Payment Records
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {loading
                                                ? "Loading payment records..."
                                                : `Showing ${payments.length} of ${pagination.total}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-3 p-4 sm:p-6">
                                    {Array.from(
                                        {
                                            length: 5
                                        }
                                    ).map(
                                        (
                                            _,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="animate-pulse rounded-lg border border-slate-100 p-4"
                                            >
                                                <div className="h-4 w-1/3 rounded bg-slate-200" />

                                                <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />

                                                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : payments.length ===
                              0 ? (
                                <div className="px-5 py-14 text-center sm:px-6 sm:py-16">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                                        ₦
                                    </div>

                                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                                        No payment records
                                        found
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        No payments match
                                        the current
                                        search and filter
                                        settings.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Member
                                                    </th>

                                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Cycle
                                                    </th>

                                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Amount
                                                    </th>

                                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Method
                                                    </th>

                                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Status
                                                    </th>

                                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Paid Date
                                                    </th>

                                                    <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-200 bg-white">
                                                {payments.map(
                                                    (
                                                        payment
                                                    ) => (
                                                        <tr
                                                            key={
                                                                payment.id
                                                            }
                                                            className="hover:bg-slate-50"
                                                        >
                                                            <td className="max-w-xs px-6 py-4">
                                                                <div className="break-words font-medium text-slate-900">
                                                                    {
                                                                        payment.full_name
                                                                    }
                                                                </div>

                                                                <div className="mt-1 break-all text-xs text-slate-500">
                                                                    {
                                                                        payment.member_id
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td className="max-w-xs px-6 py-4">
                                                                <div className="break-words text-sm text-slate-900">
                                                                    {
                                                                        payment.cycle_name
                                                                    }
                                                                </div>

                                                                <div className="mt-1 text-xs text-slate-500">
                                                                    Expected:{" "}
                                                                    {formatCurrency(
                                                                        payment.expected_amount
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                                                                {formatCurrency(
                                                                    payment.amount
                                                                )}
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                                {formatPaymentMethod(
                                                                    payment.payment_method
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                                        payment.payment_status
                                                                    )}`}
                                                                >
                                                                    {
                                                                        payment.payment_status
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                                {formatDate(
                                                                    payment.paid_at
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openPaymentDetails(
                                                                            payment.id
                                                                        )
                                                                    }
                                                                    className="inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-900"
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile and tablet cards */}
                                    <div className="divide-y divide-slate-200 lg:hidden">
                                        {payments.map(
                                            (
                                                payment
                                            ) => (
                                                <article
                                                    key={
                                                        payment.id
                                                    }
                                                    className="p-4 sm:p-5 md:p-6"
                                                >
                                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="break-words text-sm font-semibold text-slate-900 sm:text-base">
                                                                {
                                                                    payment.full_name
                                                                }
                                                            </h3>

                                                            <p className="mt-1 break-all text-xs text-slate-500">
                                                                {
                                                                    payment.member_id
                                                                }
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${getStatusClasses(
                                                                payment.payment_status
                                                            )}`}
                                                        >
                                                            {
                                                                payment.payment_status
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500">
                                                                Amount
                                                            </p>

                                                            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                                                                {formatCurrency(
                                                                    payment.amount
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500">
                                                                Method
                                                            </p>

                                                            <p className="mt-1 break-words text-sm text-slate-900">
                                                                {formatPaymentMethod(
                                                                    payment.payment_method
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500">
                                                                Cycle
                                                            </p>

                                                            <p className="mt-1 break-words text-sm text-slate-900">
                                                                {
                                                                    payment.cycle_name
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500">
                                                                Paid
                                                            </p>

                                                            <p className="mt-1 text-sm text-slate-900">
                                                                {formatDate(
                                                                    payment.paid_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openPaymentDetails(
                                                                payment.id
                                                            )
                                                        }
                                                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        View Payment
                                                    </button>
                                                </article>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Pagination */}
                            {!loading &&
                                pagination.totalPages >
                                    0 && (
                                    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                        <p className="text-sm text-slate-500">
                                            Page{" "}
                                            <span className="font-medium text-slate-700">
                                                {
                                                    pagination.page
                                                }
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium text-slate-700">
                                                {
                                                    pagination.totalPages
                                                }
                                            </span>
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 sm:flex">
                                            <button
                                                type="button"
                                                disabled={
                                                    !pagination.hasPreviousPage
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        pagination.page -
                                                            1
                                                    )
                                                }
                                                className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Previous
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    !pagination.hasNextPage
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        pagination.page +
                                                            1
                                                    )
                                                }
                                                className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                        </section>
                    </div>
                </main>
            </div>

            {/* =====================================================
                RECORD PAYMENT MODAL
            ===================================================== */}

            {showRecordModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4">
                    <div className="flex max-h-[96vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl">
                        <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="break-words text-lg font-bold text-slate-900">
                                        Record Payment
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        Record a manual
                                        contribution
                                        payment.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeRecordModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                    aria-label="Close record payment dialog"
                                    className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={
                                handleRecordPayment
                            }
                            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
                        >
                            {formError && (
                                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">
                                    {
                                        formError
                                    }
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="contribution-search"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Find contribution
                                </label>

                                <input
                                    id="contribution-search"
                                    type="text"
                                    value={
                                        contributionSearch
                                    }
                                    onChange={(event) =>
                                        setContributionSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search member, ID, phone or cycle"
                                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div className="mt-4">
                                <label
                                    htmlFor="payment-contribution"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Contribution{" "}
                                    <span className="text-red-600">
                                        *
                                    </span>
                                </label>

                                <select
                                    id="payment-contribution"
                                    name="contributionId"
                                    value={
                                        form.contributionId
                                    }
                                    onChange={
                                        handleContributionSelect
                                    }
                                    disabled={
                                        contributionsLoading
                                    }
                                    className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                                >
                                    <option value="">
                                        {contributionsLoading
                                            ? "Loading contributions..."
                                            : "Select a contribution"}
                                    </option>

                                    {contributions.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item.contribution_id
                                                }
                                                value={
                                                    item.contribution_id
                                                }
                                            >
                                                {item.full_name} —{" "}
                                                {
                                                    item.member_id
                                                } —{" "}
                                                {
                                                    item.cycle_name
                                                } — Outstanding:{" "}
                                                {formatCurrency(
                                                    item.outstanding_amount
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {selectedContribution && (
                                <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="min-w-0">
                                            <p className="text-xs text-emerald-700">
                                                Member
                                            </p>

                                            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                                                {
                                                    selectedContribution.full_name
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-emerald-700">
                                                Expected
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {formatCurrency(
                                                    selectedContribution.expected_amount
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-emerald-700">
                                                Outstanding
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {formatCurrency(
                                                    selectedContribution.outstanding_amount
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="payment-amount"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Amount{" "}
                                        <span className="text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="payment-amount"
                                        name="amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        inputMode="decimal"
                                        value={
                                            form.amount
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="3000"
                                        className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-method-select"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Payment Method{" "}
                                        <span className="text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="payment-method-select"
                                        name="paymentMethod"
                                        value={
                                            form.paymentMethod
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="CASH">
                                            Cash
                                        </option>

                                        <option value="BANK_TRANSFER">
                                            Bank Transfer
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-reference"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Payment Reference
                                    </label>

                                    <input
                                        id="payment-reference"
                                        name="paymentReference"
                                        type="text"
                                        value={
                                            form.paymentReference
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Optional reference"
                                        className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-date"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Payment Date
                                    </label>

                                    <input
                                        id="payment-date"
                                        name="paidAt"
                                        type="date"
                                        value={
                                            form.paidAt
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-5">
                                <label
                                    htmlFor="payment-notes"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Notes
                                </label>

                                <textarea
                                    id="payment-notes"
                                    name="notes"
                                    rows="4"
                                    value={
                                        form.notes
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Optional notes about this payment"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={
                                        closeRecordModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className="min-h-11 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                    className="min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {submitting
                                        ? "Recording..."
                                        : "Record Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================
                PAYMENT DETAILS MODAL
            ===================================================== */}

            {showDetailsModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4">
                    <div className="flex max-h-[96vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl">
                        <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="break-words text-lg font-bold text-slate-900">
                                        Payment Details
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        Review the payment
                                        record and its
                                        contribution.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDetailsModal
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    aria-label="Close payment details dialog"
                                    className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
                            {detailsLoading ? (
                                <div className="space-y-4">
                                    <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />

                                    <div className="h-20 animate-pulse rounded-lg bg-slate-100" />

                                    <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                                </div>
                            ) : detailsError ? (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">
                                    {
                                        detailsError
                                    }
                                </div>
                            ) : selectedPayment ? (
                                <>
                                    {actionError && (
                                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">
                                            {
                                                actionError
                                            }
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Payment Status
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                    selectedPayment.payment_status
                                                )}`}
                                            >
                                                {
                                                    selectedPayment.payment_status
                                                }
                                            </span>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-slate-500">
                                                Amount
                                            </p>

                                            <p className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                                                {formatCurrency(
                                                    selectedPayment.amount
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Member
                                            </p>

                                            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                                                {
                                                    selectedPayment.full_name
                                                }
                                            </p>

                                            <p className="mt-1 break-all text-xs text-slate-500">
                                                {
                                                    selectedPayment.member_id
                                                }
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Cycle
                                            </p>

                                            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                                                {
                                                    selectedPayment.cycle_name
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Expected Contribution
                                            </p>

                                            <p className="mt-1 text-sm text-slate-900">
                                                {formatCurrency(
                                                    selectedPayment.expected_amount
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Contribution Status
                                            </p>

                                            <span
                                                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getContributionStatusClasses(
                                                    selectedPayment.contribution_status
                                                )}`}
                                            >
                                                {
                                                    selectedPayment.contribution_status
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Payment Method
                                            </p>

                                            <p className="mt-1 break-words text-sm text-slate-900">
                                                {formatPaymentMethod(
                                                    selectedPayment.payment_method
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Payment Date
                                            </p>

                                            <p className="mt-1 text-sm text-slate-900">
                                                {formatDateTime(
                                                    selectedPayment.paid_at
                                                )}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Reference
                                            </p>

                                            <p className="mt-1 break-all text-sm text-slate-900">
                                                {selectedPayment.payment_reference ||
                                                    "No reference provided"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Recorded
                                            </p>

                                            <p className="mt-1 text-sm text-slate-900">
                                                {formatDateTime(
                                                    selectedPayment.created_at
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedPayment.notes && (
                                        <div className="mt-5 rounded-lg border border-slate-200 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Notes
                                            </p>

                                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                                {
                                                    selectedPayment.notes
                                                }
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-6 border-t border-slate-200 pt-5">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Payment Actions
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Status changes
                                            are recorded
                                            against this
                                            payment record.
                                        </p>

                                        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                                            {selectedPayment.payment_status !==
                                                "VERIFIED" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handlePaymentStatus(
                                                            "VERIFIED"
                                                        )
                                                    }
                                                    className="min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50 sm:w-auto"
                                                >
                                                    {actionLoading
                                                        ? "Updating..."
                                                        : "Mark Verified"}
                                                </button>
                                            )}

                                            {selectedPayment.payment_status !==
                                                "PENDING" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handlePaymentStatus(
                                                            "PENDING"
                                                        )
                                                    }
                                                    className="min-h-11 w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50 sm:w-auto"
                                                >
                                                    Mark Pending
                                                </button>
                                            )}

                                            {selectedPayment.payment_status !==
                                                "REJECTED" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handlePaymentStatus(
                                                            "REJECTED"
                                                        )
                                                    }
                                                    className="min-h-11 w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50 sm:w-auto"
                                                >
                                                    Mark Rejected
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-10 text-center text-sm text-slate-500">
                                    Payment details
                                    are unavailable.
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                            <button
                                type="button"
                                onClick={
                                    closeDetailsModal
                                }
                                disabled={
                                    actionLoading
                                }
                                className="min-h-11 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
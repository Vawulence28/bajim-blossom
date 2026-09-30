"use client";

import { useEffect, useState } from "react";

import {
    getAdminFines,
    getAdminFine,
    getAdminFineContributions,
    createAdminFine,
    updateAdminFine,
    updateAdminFineStatus
} from "../../../services/adminApi";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

const FINE_STATUSES = [
    {
        value: "",
        label: "All statuses"
    },
    {
        value: "OUTSTANDING",
        label: "Outstanding"
    },
    {
        value: "PAID",
        label: "Paid"
    },
    {
        value: "WAIVED",
        label: "Waived"
    }
];

function formatCurrency(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function getStatusClasses(status) {
    if (status === "OUTSTANDING") {
        return "bg-amber-100 text-amber-800";
    }

    if (status === "PAID") {
        return "bg-emerald-100 text-emerald-800";
    }

    if (status === "WAIVED") {
        return "bg-slate-200 text-slate-700";
    }

    return "bg-slate-100 text-slate-700";
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                status
            )}`}
        >
            <span className="truncate">
                {status || "Unknown"}
            </span>
        </span>
    );
}

function Modal({
    title,
    children,
    onClose,
    wide = false
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
            <div
                className={`flex max-h-[94vh] w-full min-w-0 flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl ${
                    wide
                        ? "sm:max-w-3xl"
                        : "sm:max-w-xl"
                }`}
            >
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
                    <h2 className="min-w-0 break-words text-lg font-bold text-slate-900 sm:text-xl">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        ✕
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function AdminFinesPage() {
    const [fines, setFines] = useState([]);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        });

    const [searchInput, setSearchInput] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [selectedFine, setSelectedFine] =
        useState(null);

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [showDetailsModal, setShowDetailsModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [actionError, setActionError] =
        useState("");

    const [contributions, setContributions] =
        useState([]);

    const [
        contributionsLoading,
        setContributionsLoading
    ] = useState(false);

    const [form, setForm] = useState({
        contributionId: "",
        amount: "",
        reason: "",
        appliedAt: new Date()
            .toISOString()
            .slice(0, 10),
        notes: ""
    });

    const [editForm, setEditForm] = useState({
        amount: "",
        reason: "",
        appliedAt: "",
        notes: ""
    });

    async function loadFines(
        requestedPage = pagination.page
    ) {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminFines({
                search,
                status,
                page: requestedPage,
                limit: pagination.limit
            });

            setFines(data.fines || []);

            setPagination(
                data.pagination || {
                    page: requestedPage,
                    limit: pagination.limit,
                    total: 0,
                    totalPages: 0
                }
            );
        } catch (err) {
            setError(
                err.message ||
                    "Unable to load fines."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function fetchFines() {
            try {
                setLoading(true);
                setError("");

                const data = await getAdminFines({
                    search,
                    status,
                    page: 1,
                    limit: pagination.limit
                });

                if (cancelled) {
                    return;
                }

                setFines(data.fines || []);

                setPagination(
                    data.pagination || {
                        page: 1,
                        limit: pagination.limit,
                        total: 0,
                        totalPages: 0
                    }
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                setError(
                    err.message ||
                        "Unable to load fines."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        const timer = setTimeout(() => {
            fetchFines();
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [search, status, pagination.limit]);

    async function loadContributions() {
        try {
            setContributionsLoading(true);
            setActionError("");

            const data =
                await getAdminFineContributions({
                    limit: 100
                });

            setContributions(
                data.contributions || []
            );
        } catch (err) {
            setActionError(
                err.message ||
                    "Unable to load contributions."
            );
        } finally {
            setContributionsLoading(false);
        }
    }

    function openCreateModal() {
        setActionError("");

        setForm({
            contributionId: "",
            amount: "",
            reason: "",
            appliedAt: new Date()
                .toISOString()
                .slice(0, 10),
            notes: ""
        });

        setShowCreateModal(true);

        loadContributions();
    }

    async function openDetails(fine) {
        try {
            setActionError("");
            setSelectedFine(fine);
            setShowDetailsModal(true);

            const data =
                await getAdminFine(fine.id);

            setSelectedFine(
                data.fine || fine
            );
        } catch (err) {
            setActionError(
                err.message ||
                    "Unable to load fine details."
            );
        }
    }

    function openEditModal(fine) {
        setActionError("");
        setSelectedFine(fine);

        setEditForm({
            amount: fine.amount ?? "",
            reason: fine.reason ?? "",
            appliedAt: fine.applied_at
                ? new Date(fine.applied_at)
                      .toISOString()
                      .slice(0, 10)
                : "",
            notes: fine.notes ?? ""
        });

        setShowEditModal(true);
    }

    async function handleCreateFine(event) {
        event.preventDefault();

        try {
            setActionLoading(true);
            setActionError("");

            await createAdminFine({
                contributionId:
                    form.contributionId,
                amount: Number(form.amount),
                reason: form.reason,
                appliedAt: form.appliedAt,
                notes: form.notes
            });

            setShowCreateModal(false);

            await loadFines(1);
        } catch (err) {
            setActionError(
                err.message ||
                    "Unable to apply fine."
            );
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateFine(event) {
        event.preventDefault();

        if (!selectedFine) {
            return;
        }

        try {
            setActionLoading(true);
            setActionError("");

            await updateAdminFine(
                selectedFine.id,
                {
                    amount: Number(
                        editForm.amount
                    ),
                    reason: editForm.reason,
                    appliedAt:
                        editForm.appliedAt,
                    notes: editForm.notes
                }
            );

            setShowEditModal(false);
            setShowDetailsModal(false);

            await loadFines(
                pagination.page
            );
        } catch (err) {
            setActionError(
                err.message ||
                    "Unable to update fine."
            );
        } finally {
            setActionLoading(false);
        }
    }

    async function handleStatusChange(
        fine,
        nextStatus
    ) {
        const action =
            nextStatus === "PAID"
                ? "mark this fine as paid"
                : "waive this fine";

        const confirmed = window.confirm(
            `Are you sure you want to ${action}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setActionError("");

            await updateAdminFineStatus(
                fine.id,
                nextStatus
            );

            if (
                selectedFine?.id === fine.id
            ) {
                setShowDetailsModal(false);
                setSelectedFine(null);
            }

            await loadFines(
                pagination.page
            );
        } catch (err) {
            setActionError(
                err.message ||
                    "Unable to update fine status."
            );
        } finally {
            setActionLoading(false);
        }
    }

    function handleSearchSubmit(event) {
        event.preventDefault();

        setSearch(
            searchInput.trim()
        );
    }

    function handleStatusFilter(value) {
        setStatus(value);
    }

    function goToPage(page) {
        if (
            page < 1 ||
            page > pagination.totalPages
        ) {
            return;
        }

        loadFines(page);
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
            <AdminSidebar />

            <div className="min-w-0 lg:pl-64">
                <AdminMobileNav />

                <main className="px-3 pb-8 pt-5 sm:px-5 sm:pb-10 sm:pt-6 md:px-6 lg:px-8 lg:pt-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-emerald-700">
                                    Administration
                                </p>

                                <h1 className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                                    Fines
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                    Manage contribution
                                    fines and preserve
                                    their financial
                                    history.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    openCreateModal
                                }
                                className="min-h-11 w-full shrink-0 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:w-auto"
                            >
                                Apply Fine
                            </button>
                        </div>

                        {actionError && (
                            <div className="mb-4 break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                {actionError}
                            </div>
                        )}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            {/* Filters */}
                            <div className="border-b border-slate-200 p-3 sm:p-4">
                                <form
                                    onSubmit={
                                        handleSearchSubmit
                                    }
                                    className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]"
                                >
                                    <div className="min-w-0">
                                        <label
                                            htmlFor="fine-search"
                                            className="sr-only"
                                        >
                                            Search fines
                                        </label>

                                        <input
                                            id="fine-search"
                                            type="search"
                                            value={
                                                searchInput
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSearchInput(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Search member, phone, email, ID, cycle or reason..."
                                            className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <label
                                            htmlFor="fine-status"
                                            className="sr-only"
                                        >
                                            Filter by
                                            status
                                        </label>

                                        <select
                                            id="fine-status"
                                            value={status}
                                            onChange={(
                                                event
                                            ) =>
                                                handleStatusFilter(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                        >
                                            {FINE_STATUSES.map(
                                                (
                                                    item
                                                ) => (
                                                    <option
                                                        key={
                                                            item.value
                                                        }
                                                        value={
                                                            item.value
                                                        }
                                                    >
                                                        {
                                                            item.label
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Search
                                    </button>
                                </form>
                            </div>

                            {/* Result count */}
                            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
                                <p className="break-words text-sm text-slate-600">
                                    {loading
                                        ? "Loading fines..."
                                        : `Showing ${fines.length} of ${pagination.total} fines`}
                                </p>
                            </div>

                            {/* Loading */}
                            {loading ? (
                                <div className="px-5 py-12 text-center text-sm text-slate-500">
                                    Loading fines...
                                </div>
                            ) : error ? (
                                <div className="px-5 py-12 text-center">
                                    <p className="break-words text-sm text-red-600">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            loadFines(
                                                pagination.page
                                            )
                                        }
                                        className="mt-4 min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : fines.length ===
                              0 ? (
                                <div className="px-5 py-12 text-center">
                                    <h2 className="font-semibold text-slate-900">
                                        No fines found
                                    </h2>

                                    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                                        There are no
                                        fines matching
                                        the current
                                        filters.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="min-w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Member
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Cycle
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Amount
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Reason
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Applied
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Status
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-200">
                                                {fines.map(
                                                    (
                                                        fine
                                                    ) => (
                                                        <tr
                                                            key={
                                                                fine.id
                                                            }
                                                            className="transition hover:bg-slate-50"
                                                        >
                                                            <td className="max-w-[14rem] px-4 py-4">
                                                                <div className="break-words font-semibold text-slate-900">
                                                                    {
                                                                        fine.full_name
                                                                    }
                                                                </div>

                                                                <div className="mt-1 break-all text-xs text-slate-500">
                                                                    {
                                                                        fine.member_id
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td className="max-w-[12rem] px-4 py-4 text-sm text-slate-700">
                                                                <div className="break-words">
                                                                    {
                                                                        fine.cycle_name
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                                                                {formatCurrency(
                                                                    fine.amount
                                                                )}
                                                            </td>

                                                            <td className="max-w-xs px-4 py-4 text-sm text-slate-600">
                                                                <div
                                                                    className="truncate"
                                                                    title={
                                                                        fine.reason ||
                                                                        ""
                                                                    }
                                                                >
                                                                    {fine.reason ||
                                                                        "—"}
                                                                </div>
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                                                {formatDate(
                                                                    fine.applied_at
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                <StatusBadge
                                                                    status={
                                                                        fine.status
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="px-4 py-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openDetails(
                                                                            fine
                                                                        )
                                                                    }
                                                                    className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
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

                                    {/* Mobile + tablet cards */}
                                    <div className="divide-y divide-slate-200 lg:hidden">
                                        {fines.map(
                                            (
                                                fine
                                            ) => (
                                                <article
                                                    key={
                                                        fine.id
                                                    }
                                                    className="min-w-0 p-4 sm:p-5"
                                                >
                                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h3 className="break-words font-semibold text-slate-900">
                                                                {
                                                                    fine.full_name
                                                                }
                                                            </h3>

                                                            <p className="mt-1 break-all text-xs text-slate-500">
                                                                {
                                                                    fine.member_id
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0">
                                                            <StatusBadge
                                                                status={
                                                                    fine.status
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500">
                                                                Amount
                                                            </p>

                                                            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                                                                {formatCurrency(
                                                                    fine.amount
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500">
                                                                Applied
                                                            </p>

                                                            <p className="mt-1 text-sm text-slate-700">
                                                                {formatDate(
                                                                    fine.applied_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0 sm:col-span-2">
                                                            <p className="text-xs text-slate-500">
                                                                Cycle
                                                            </p>

                                                            <p className="mt-1 break-words text-sm text-slate-700">
                                                                {
                                                                    fine.cycle_name
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <p className="text-xs text-slate-500">
                                                            Reason
                                                        </p>

                                                        <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                                                            {fine.reason ||
                                                                "—"}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDetails(
                                                                fine
                                                            )
                                                        }
                                                        className="mt-4 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        View Details
                                                    </button>
                                                </article>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages >
                                1 && (
                                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page <=
                                            1
                                        }
                                        onClick={() =>
                                            goToPage(
                                                pagination.page -
                                                    1
                                            )
                                        }
                                        className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-center text-sm text-slate-600">
                                        Page{" "}
                                        {
                                            pagination.page
                                        }{" "}
                                        of{" "}
                                        {
                                            pagination.totalPages
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page >=
                                            pagination.totalPages
                                        }
                                        onClick={() =>
                                            goToPage(
                                                pagination.page +
                                                    1
                                            )
                                        }
                                        className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>

            {/* Create Fine Modal */}
            {showCreateModal && (
                <Modal
                    title="Apply Fine"
                    onClose={() =>
                        setShowCreateModal(false)
                    }
                >
                    <form
                        onSubmit={
                            handleCreateFine
                        }
                        className="space-y-5"
                    >
                        {actionError && (
                            <div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                {actionError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Contribution
                            </label>

                            <select
                                required
                                value={
                                    form.contributionId
                                }
                                onChange={(event) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            contributionId:
                                                event
                                                    .target
                                                    .value
                                        })
                                    )
                                }
                                disabled={
                                    contributionsLoading
                                }
                                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">
                                    {contributionsLoading
                                        ? "Loading contributions..."
                                        : "Select contribution"}
                                </option>

                                {contributions.map(
                                    (
                                        contribution
                                    ) => (
                                        <option
                                            key={
                                                contribution.id
                                            }
                                            value={
                                                contribution.id
                                            }
                                        >
                                            {
                                                contribution.full_name
                                            }{" "}
                                            —{" "}
                                            {
                                                contribution.member_id
                                            }{" "}
                                            —{" "}
                                            {
                                                contribution.cycle_name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Fine Amount
                            </label>

                            <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={
                                    form.amount
                                }
                                onChange={(event) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            amount: event
                                                .target
                                                .value
                                        })
                                    )
                                }
                                placeholder="500"
                                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Reason
                            </label>

                            <input
                                type="text"
                                value={
                                    form.reason
                                }
                                onChange={(event) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            reason: event
                                                .target
                                                .value
                                        })
                                    )
                                }
                                placeholder="Late contribution"
                                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Applied Date
                            </label>

                            <input
                                required
                                type="date"
                                value={
                                    form.appliedAt
                                }
                                onChange={(event) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            appliedAt:
                                                event
                                                    .target
                                                    .value
                                        })
                                    )
                                }
                                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Notes
                            </label>

                            <textarea
                                rows={3}
                                value={
                                    form.notes
                                }
                                onChange={(event) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            notes: event
                                                .target
                                                .value
                                        })
                                    )
                                }
                                placeholder="Optional notes"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreateModal(
                                        false
                                    )
                                }
                                className="min-h-11 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    actionLoading
                                }
                                className="min-h-11 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                            >
                                {actionLoading
                                    ? "Applying..."
                                    : "Apply Fine"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Details Modal */}
            {showDetailsModal &&
                selectedFine && (
                    <Modal
                        title="Fine Details"
                        onClose={() => {
                            setShowDetailsModal(
                                false
                            );
                            setSelectedFine(null);
                        }}
                        wide
                    >
                        <div className="space-y-6">
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                                        {
                                            selectedFine.full_name
                                        }
                                    </h3>

                                    <p className="mt-1 break-all text-sm text-slate-500">
                                        {
                                            selectedFine.member_id
                                        }
                                    </p>
                                </div>

                                <div className="shrink-0 self-start">
                                    <StatusBadge
                                        status={
                                            selectedFine.status
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="min-w-0 rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Fine Amount
                                    </p>

                                    <p className="mt-1 break-words text-lg font-bold text-slate-900">
                                        {formatCurrency(
                                            selectedFine.amount
                                        )}
                                    </p>
                                </div>

                                <div className="min-w-0 rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Applied Date
                                    </p>

                                    <p className="mt-1 break-words font-semibold text-slate-900">
                                        {formatDate(
                                            selectedFine.applied_at
                                        )}
                                    </p>
                                </div>

                                <div className="min-w-0 rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Cycle
                                    </p>

                                    <p className="mt-1 break-words font-semibold text-slate-900">
                                        {
                                            selectedFine.cycle_name
                                        }
                                    </p>
                                </div>

                                <div className="min-w-0 rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Member Phone
                                    </p>

                                    <p className="mt-1 break-all font-semibold text-slate-900">
                                        {
                                            selectedFine.phone
                                        }
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    Reason
                                </p>

                                <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                                    {selectedFine.reason ||
                                        "No reason provided."}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    Notes
                                </p>

                                <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                                    {selectedFine.notes ||
                                        "No notes."}
                                </p>
                            </div>

                            {selectedFine.status ===
                                "OUTSTANDING" && (
                                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openEditModal(
                                                selectedFine
                                            )
                                        }
                                        className="min-h-11 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            actionLoading
                                        }
                                        onClick={() =>
                                            handleStatusChange(
                                                selectedFine,
                                                "WAIVED"
                                            )
                                        }
                                        className="min-h-11 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Waive Fine
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            actionLoading
                                        }
                                        onClick={() =>
                                            handleStatusChange(
                                                selectedFine,
                                                "PAID"
                                            )
                                        }
                                        className="min-h-11 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                                    >
                                        Mark as Paid
                                    </button>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}

            {/* Edit Fine Modal */}
            {showEditModal &&
                selectedFine && (
                    <Modal
                        title="Edit Outstanding Fine"
                        onClose={() =>
                            setShowEditModal(
                                false
                            )
                        }
                    >
                        <form
                            onSubmit={
                                handleUpdateFine
                            }
                            className="space-y-5"
                        >
                            {actionError && (
                                <div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                    {actionError}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Fine Amount
                                </label>

                                <input
                                    required
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        editForm.amount
                                    }
                                    onChange={(event) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                amount: event
                                                    .target
                                                    .value
                                            })
                                        )
                                    }
                                    className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Reason
                                </label>

                                <input
                                    type="text"
                                    value={
                                        editForm.reason
                                    }
                                    onChange={(event) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                reason: event
                                                    .target
                                                    .value
                                            })
                                        )
                                    }
                                    className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Applied Date
                                </label>

                                <input
                                    required
                                    type="date"
                                    value={
                                        editForm.appliedAt
                                    }
                                    onChange={(event) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                appliedAt:
                                                    event
                                                        .target
                                                        .value
                                            })
                                        )
                                    }
                                    className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Notes
                                </label>

                                <textarea
                                    rows={3}
                                    value={
                                        editForm.notes
                                    }
                                    onChange={(event) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                notes: event
                                                    .target
                                                    .value
                                            })
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEditModal(
                                            false
                                        )
                                    }
                                    className="min-h-11 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        actionLoading
                                    }
                                    className="min-h-11 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                                >
                                    {actionLoading
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";

import {
    getAdminMembers,
    getAdminMember,
    updateAdminMemberStatus
} from "../../../services/adminApi";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

const STATUS_OPTIONS = [
    {
        value: "",
        label: "All statuses"
    },
    {
        value: "PENDING_APPROVAL",
        label: "Pending approval"
    },
    {
        value: "ACTIVE",
        label: "Active"
    },
    {
        value: "INACTIVE",
        label: "Inactive"
    },
    {
        value: "REJECTED",
        label: "Rejected"
    }
];

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
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function formatCurrency(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2
    }).format(amount);
}

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function StatusBadge({ status }) {
    const styles = {
        ACTIVE:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        INACTIVE:
            "bg-slate-100 text-slate-600 border-slate-200",
        PENDING_APPROVAL:
            "bg-blue-50 text-blue-700 border-blue-200",
        REJECTED:
            "bg-red-50 text-red-700 border-red-200"
    };

    return (
        <span
            className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                styles[status] ||
                "bg-slate-100 text-slate-600 border-slate-200"
            }`}
        >
            {formatStatus(status)}
        </span>
    );
}

function Detail({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:text-xs sm:tracking-wide">
                {label}
            </p>

            <p className="mt-1 break-words text-sm leading-5 text-slate-700">
                {value || "—"}
            </p>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    description
}) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:text-xs sm:tracking-wide">
                {label}
            </p>

            <p className="mt-2 break-words text-lg font-semibold text-slate-800 sm:text-xl">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function AdminMembersPage() {
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMember, setSelectedMember] =
        useState(null);
    const [detailsLoading, setDetailsLoading] =
        useState(false);
    const [actionLoading, setActionLoading] =
        useState(false);
    const [actionError, setActionError] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchMembers() {
            try {
                setLoading(true);
                setError("");

                const result =
                    await getAdminMembers({
                        search,
                        status,
                        page,
                        limit: 20
                    });

                if (cancelled) {
                    return;
                }

                setMembers(result.data || []);

                setPagination(
                    result.pagination || {
                        page,
                        limit: 20,
                        total: 0,
                        totalPages: 1
                    }
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Load members error:",
                    err
                );

                setError(
                    err.message ||
                        "Unable to load members."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchMembers();

        return () => {
            cancelled = true;
        };
    }, [
        search,
        status,
        page,
        refreshKey
    ]);

    async function handleViewMember(memberId) {
        try {
            setDetailsLoading(true);
            setActionError("");

            const result =
                await getAdminMember(memberId);

            setSelectedMember(
                result.data || result
            );
        } catch (err) {
            console.error(
                "Load member details error:",
                err
            );

            setActionError(
                err.message ||
                    "Unable to load member details."
            );
        } finally {
            setDetailsLoading(false);
        }
    }

    async function handleStatusChange(
        member,
        newStatus
    ) {
        const messages = {
            ACTIVE:
                "Are you sure you want to activate this member?",
            INACTIVE:
                "Are you sure you want to deactivate this member?",
            REJECTED:
                "Are you sure you want to reject this member?"
        };

        if (
            !window.confirm(
                messages[newStatus] ||
                    "Are you sure you want to change this member's status?"
            )
        ) {
            return;
        }

        try {
            setActionLoading(true);
            setActionError("");

            await updateAdminMemberStatus(
                member.id,
                newStatus
            );

            setRefreshKey(
                (current) => current + 1
            );

            const refreshed =
                await getAdminMember(
                    member.id
                );

            setSelectedMember(
                refreshed.data || refreshed
            );
        } catch (err) {
            console.error(
                "Update member status error:",
                err
            );

            setActionError(
                err.message ||
                    "Unable to update member status."
            );
        } finally {
            setActionLoading(false);
        }
    }

    function handleSearchSubmit(event) {
        event.preventDefault();

        if (page !== 1) {
            setPage(1);
            return;
        }

        setRefreshKey(
            (current) => current + 1
        );
    }

    function handleStatusFilterChange(event) {
        setStatus(event.target.value);
        setPage(1);
    }

    function closeMemberDetails() {
        if (actionLoading) {
            return;
        }

        setSelectedMember(null);
        setActionError("");
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            <AdminSidebar />

            <div className="min-h-screen lg:pl-64">
                <AdminMobileNav />

                <main className="min-h-screen px-3 pb-8 pt-5 sm:px-5 sm:pb-10 sm:pt-6 md:px-6 lg:px-8 lg:pt-8">
                    <div className="mx-auto w-full max-w-7xl min-w-0">
                        {/* Page Header */}
                        <header className="mb-5 sm:mb-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-emerald-700">
                                        Administration
                                    </p>

                                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                        Members
                                    </h1>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                        Manage member accounts,
                                        review member
                                        information, and
                                        control account
                                        status.
                                    </p>
                                </div>

                                <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:w-auto sm:min-w-36">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:text-xs sm:tracking-wide">
                                        Total Members
                                    </p>

                                    <p className="mt-1 text-xl font-semibold text-slate-800">
                                        {pagination.total ||
                                            0}
                                    </p>
                                </div>
                            </div>
                        </header>

                        {/* Filters */}
                        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
                            <form
                                onSubmit={
                                    handleSearchSubmit
                                }
                                className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto] lg:items-end"
                            >
                                <div className="min-w-0">
                                    <label
                                        htmlFor="member-search"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Search members
                                    </label>

                                    <input
                                        id="member-search"
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Name, phone, email or member ID"
                                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:px-4"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label
                                        htmlFor="member-status"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="member-status"
                                        value={status}
                                        onChange={
                                            handleStatusFilterChange
                                        }
                                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:px-4"
                                    >
                                        {STATUS_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={
                                                        option.value
                                                    }
                                                    value={
                                                        option.value
                                                    }
                                                >
                                                    {
                                                        option.label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="min-h-11 w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:bg-slate-950 lg:w-auto"
                                >
                                    Search
                                </button>
                            </form>
                        </section>

                        {/* Error */}
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mb-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="break-words">
                                        {error}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRefreshKey(
                                                (current) =>
                                                    current +
                                                    1
                                            )
                                        }
                                        className="min-h-10 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 sm:w-fit"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Directory */}
                        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-slate-800">
                                            Member Directory
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Review and manage
                                            registered
                                            members.
                                        </p>
                                    </div>

                                    {!loading && (
                                        <p className="text-xs text-slate-400 sm:text-right">
                                            Showing{" "}
                                            {
                                                members.length
                                            }{" "}
                                            of{" "}
                                            {
                                                pagination.total
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Loading */}
                            {loading ? (
                                <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
                                    {Array.from({
                                        length: 6
                                    }).map(
                                        (_, index) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="animate-pulse rounded-xl border border-slate-100 p-4"
                                            >
                                                <div className="h-4 w-2/3 rounded bg-slate-200 sm:w-1/3" />

                                                <div className="mt-3 h-3 w-full rounded bg-slate-100 sm:w-2/3" />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : members.length ===
                              0 ? (
                                <div className="px-5 py-14 text-center sm:px-6 sm:py-16">
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        No members found
                                    </h3>

                                    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                                        Try changing your
                                        search term or
                                        status filter.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Member
                                                    </th>

                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Member ID
                                                    </th>

                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Contact
                                                    </th>

                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Status
                                                    </th>

                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Joined
                                                    </th>

                                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {members.map(
                                                    (
                                                        member
                                                    ) => (
                                                        <tr
                                                            key={
                                                                member.id
                                                            }
                                                            className="transition hover:bg-slate-50"
                                                        >
                                                            <td className="max-w-xs px-6 py-4">
                                                                <p className="break-words font-medium text-slate-800">
                                                                    {member.full_name ||
                                                                        "Unnamed member"}
                                                                </p>

                                                                <p className="mt-1 break-all text-xs text-slate-400">
                                                                    {member.email ||
                                                                        "No email"}
                                                                </p>
                                                            </td>

                                                            <td className="px-6 py-4 font-mono text-sm text-slate-700">
                                                                <span className="break-all">
                                                                    {member.member_id ||
                                                                        "Not assigned"}
                                                                </span>
                                                            </td>

                                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                                {member.phone ||
                                                                    "—"}
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <StatusBadge
                                                                    status={
                                                                        member.status
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                                {formatDate(
                                                                    member.joined_at
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleViewMember(
                                                                            member.id
                                                                        )
                                                                    }
                                                                    className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
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

                                    {/* Mobile / Tablet Cards */}
                                    <div className="divide-y divide-slate-100 lg:hidden">
                                        {members.map(
                                            (member) => (
                                                <article
                                                    key={
                                                        member.id
                                                    }
                                                    className="p-4 sm:p-5"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="break-words font-medium text-slate-800">
                                                                {member.full_name ||
                                                                    "Unnamed member"}
                                                            </p>

                                                            <p className="mt-1 break-all font-mono text-xs text-slate-400">
                                                                {member.member_id ||
                                                                    "Not assigned"}
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0">
                                                            <StatusBadge
                                                                status={
                                                                    member.status
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                                                        <Detail
                                                            label="Phone"
                                                            value={
                                                                member.phone
                                                            }
                                                        />

                                                        <Detail
                                                            label="Joined"
                                                            value={formatDate(
                                                                member.joined_at
                                                            )}
                                                        />

                                                        <Detail
                                                            label="Email"
                                                            value={
                                                                member.email
                                                            }
                                                        />

                                                        <Detail
                                                            label="Role"
                                                            value={
                                                                member.role
                                                            }
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewMember(
                                                                member.id
                                                            )
                                                        }
                                                        className="mt-5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                                                    >
                                                        View Member
                                                    </button>
                                                </article>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Pagination */}
                            {!loading &&
                                members.length > 0 && (
                                    <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-center text-sm text-slate-500 sm:text-left">
                                                Page{" "}
                                                {
                                                    pagination.page
                                                }{" "}
                                                of{" "}
                                                {
                                                    pagination.totalPages
                                                }
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 sm:flex">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        page <=
                                                        1
                                                    }
                                                    onClick={() =>
                                                        setPage(
                                                            (
                                                                current
                                                            ) =>
                                                                current -
                                                                1
                                                        )
                                                    }
                                                    className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Previous
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        page >=
                                                        pagination.totalPages
                                                    }
                                                    onClick={() =>
                                                        setPage(
                                                            (
                                                                current
                                                            ) =>
                                                                current +
                                                                1
                                                        )
                                                    }
                                                    className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </section>
                    </div>
                </main>
            </div>

            {/* Member Details Modal */}
            {selectedMember && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeMemberDetails();
                        }
                    }}
                >
                    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
                        {/* Modal Header */}
                        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-700 sm:text-xs sm:tracking-wide">
                                        Member Profile
                                    </p>

                                    <h2 className="mt-1 break-words text-lg font-semibold text-slate-900 sm:text-xl">
                                        {selectedMember.full_name ||
                                            "Member Details"}
                                    </h2>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <StatusBadge
                                            status={
                                                selectedMember.status
                                            }
                                        />

                                        {selectedMember.member_id && (
                                            <span className="max-w-full break-all rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                                                {
                                                    selectedMember.member_id
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeMemberDetails
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Close member details"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 6l12 12M18 6L6 18"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            {detailsLoading ? (
                                <div className="space-y-4 p-4 sm:p-6">
                                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 sm:w-1/3" />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {Array.from({
                                            length: 8
                                        }).map(
                                            (
                                                _,
                                                index
                                            ) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 p-4 sm:p-6">
                                    {actionError && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                                            {
                                                actionError
                                            }
                                        </div>
                                    )}

                                    {/* Personal Information */}
                                    <section>
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Personal
                                            Information
                                        </h3>

                                        <div className="mt-3 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <Detail
                                                label="Full Name"
                                                value={
                                                    selectedMember.full_name
                                                }
                                            />

                                            <Detail
                                                label="Member ID"
                                                value={
                                                    selectedMember.member_id
                                                }
                                            />

                                            <Detail
                                                label="Phone"
                                                value={
                                                    selectedMember.phone
                                                }
                                            />

                                            <Detail
                                                label="Email"
                                                value={
                                                    selectedMember.email
                                                }
                                            />

                                            <Detail
                                                label="Address"
                                                value={
                                                    selectedMember.address
                                                }
                                            />

                                            <Detail
                                                label="Emergency Contact"
                                                value={
                                                    selectedMember.emergency_contact
                                                }
                                            />

                                            <Detail
                                                label="Role"
                                                value={
                                                    selectedMember.role
                                                }
                                            />

                                            <Detail
                                                label="Status"
                                                value={formatStatus(
                                                    selectedMember.status
                                                )}
                                            />

                                            <Detail
                                                label="Joined"
                                                value={formatDate(
                                                    selectedMember.joined_at
                                                )}
                                            />
                                        </div>
                                    </section>

                                    {/* Contribution Summary */}
                                    <section>
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Contribution
                                            Summary
                                        </h3>

                                        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <SummaryCard
                                                label="Contributions"
                                                value={
                                                    selectedMember.total_contributions ??
                                                    0
                                                }
                                                description="Total contribution records"
                                            />

                                            <SummaryCard
                                                label="Expected"
                                                value={formatCurrency(
                                                    selectedMember.expected_amount
                                                )}
                                                description="Expected contribution amount"
                                            />

                                            <SummaryCard
                                                label="Verified Paid"
                                                value={formatCurrency(
                                                    selectedMember.verified_paid_amount
                                                )}
                                                description="Verified payments"
                                            />

                                            <SummaryCard
                                                label="Outstanding"
                                                value={formatCurrency(
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            selectedMember.expected_amount ||
                                                                0
                                                        ) -
                                                            Number(
                                                                selectedMember.verified_paid_amount ||
                                                                    0
                                                            )
                                                    )
                                                )}
                                                description="Expected less verified payments"
                                            />
                                        </div>
                                    </section>

                                    {/* Fines */}
                                    <section>
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Fines
                                        </h3>

                                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                            <SummaryCard
                                                label="Total Fines"
                                                value={
                                                    selectedMember.total_fines ??
                                                    0
                                                }
                                                description="Recorded fine entries"
                                            />

                                            <SummaryCard
                                                label="Outstanding Fines"
                                                value={formatCurrency(
                                                    selectedMember.outstanding_fines
                                                )}
                                                description="Currently outstanding"
                                            />
                                        </div>
                                    </section>

                                    {/* Account Information */}
                                    <section>
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Account
                                            Information
                                        </h3>

                                        <div className="mt-3 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                                            <Detail
                                                label="Account Active"
                                                value={
                                                    selectedMember.is_active
                                                        ? "Yes"
                                                        : "No"
                                                }
                                            />

                                            <Detail
                                                label="Last Login"
                                                value={formatDateTime(
                                                    selectedMember.last_login_at
                                                )}
                                            />
                                        </div>
                                    </section>

                                    {/* Member Actions */}
                                    <section className="border-t border-slate-200 pt-5">
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Member Actions
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Status changes do
                                            not delete the
                                            member&apos;s
                                            contribution,
                                            payment, or fine
                                            history.
                                        </p>

                                        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                                            {selectedMember.status ===
                                                "PENDING_APPROVAL" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            actionLoading
                                                        }
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                selectedMember,
                                                                "ACTIVE"
                                                            )
                                                        }
                                                        className="min-h-11 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                    >
                                                        {actionLoading
                                                            ? "Processing..."
                                                            : "Approve & Activate"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            actionLoading
                                                        }
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                selectedMember,
                                                                "REJECTED"
                                                            )
                                                        }
                                                        className="min-h-11 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {selectedMember.status ===
                                                "ACTIVE" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            selectedMember,
                                                            "INACTIVE"
                                                        )
                                                    }
                                                    className="min-h-11 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                >
                                                    {actionLoading
                                                        ? "Processing..."
                                                        : "Deactivate"}
                                                </button>
                                            )}

                                            {selectedMember.status ===
                                                "INACTIVE" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            selectedMember,
                                                            "ACTIVE"
                                                        )
                                                    }
                                                    className="min-h-11 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                >
                                                    {actionLoading
                                                        ? "Processing..."
                                                        : "Reactivate"}
                                                </button>
                                            )}

                                            {selectedMember.status ===
                                                "REJECTED" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            selectedMember,
                                                            "ACTIVE"
                                                        )
                                                    }
                                                    className="min-h-11 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                >
                                                    {actionLoading
                                                        ? "Processing..."
                                                        : "Activate"}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading
                                                }
                                                onClick={
                                                    closeMemberDetails
                                                }
                                                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import {
    useCallback,
    useEffect,
    useState
} from "react";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

import {
    getContactEnquiries,
    getContactEnquiry,
    updateContactEnquiry
} from "../../../services/contactApi";

const ENQUIRY_STATUSES = [
    "NEW",
    "IN_PROGRESS",
    "RESOLVED",
    "ARCHIVED"
];

const STATUS_LABELS = {
    NEW: "New",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    ARCHIVED: "Archived"
};

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function getStatusClasses(status) {
    switch (status) {
        case "NEW":
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "IN_PROGRESS":
            return "border-amber-200 bg-amber-50 text-amber-700";

        case "RESOLVED":
            return "border-green-200 bg-green-50 text-green-700";

        case "ARCHIVED":
            return "border-gray-200 bg-gray-100 text-gray-600";

        default:
            return "border-gray-200 bg-gray-100 text-gray-600";
    }
}

function getInitials(name) {
    if (!name) {
        return "?";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
}

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] =
        useState([]);

    const [selectedEnquiry, setSelectedEnquiry] =
        useState(null);

    const [statusFilter, setStatusFilter] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [loadingDetails, setLoadingDetails] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [editStatus, setEditStatus] =
        useState("NEW");

    const [adminNotes, setAdminNotes] =
        useState("");

    const loadEnquiries =
        useCallback(async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getContactEnquiries({
                        status: statusFilter,
                        search,
                        limit: 50,
                        offset: 0
                    });

                setEnquiries(
                    response?.data?.enquiries ||
                        response?.enquiries ||
                        []
                );
            } catch (requestError) {
                console.error(
                    "Failed to load contact enquiries:",
                    requestError
                );

                setError(
                    requestError?.message ||
                        "Unable to load contact enquiries."
                );
            } finally {
                setLoading(false);
            }
        }, [statusFilter, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadEnquiries();
        }, 250);

        return () => {
            clearTimeout(timer);
        };
    }, [loadEnquiries]);

    const openEnquiry = async (id) => {
        if (!id) {
            return;
        }

        try {
            setLoadingDetails(true);
            setError("");
            setSuccess("");

            const response =
                await getContactEnquiry(id);

            const enquiry =
                response?.data?.enquiry ||
                response?.enquiry ||
                response?.data ||
                response;

            setSelectedEnquiry(enquiry);

            setEditStatus(
                enquiry?.status || "NEW"
            );

            setAdminNotes(
                enquiry?.admin_notes || ""
            );
        } catch (requestError) {
            console.error(
                "Failed to load contact enquiry:",
                requestError
            );

            setError(
                requestError?.message ||
                    "Unable to load this enquiry."
            );
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeEnquiry = () => {
        if (saving) {
            return;
        }

        setSelectedEnquiry(null);
        setEditStatus("NEW");
        setAdminNotes("");
    };

    const handleSave = async () => {
        if (!selectedEnquiry?.id) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response =
                await updateContactEnquiry(
                    selectedEnquiry.id,
                    {
                        status: editStatus,
                        adminNotes
                    }
                );

            const updatedEnquiry =
                response?.data?.enquiry ||
                response?.enquiry ||
                response?.data ||
                response;

            setSelectedEnquiry(
                updatedEnquiry
            );

            setEditStatus(
                updatedEnquiry?.status ||
                    editStatus
            );

            setAdminNotes(
                updatedEnquiry?.admin_notes ??
                    adminNotes
            );

            setSuccess(
                "Enquiry updated successfully."
            );

            await loadEnquiries();
        } catch (requestError) {
            console.error(
                "Failed to update contact enquiry:",
                requestError
            );

            setError(
                requestError?.message ||
                    "Unable to update this enquiry."
            );
        } finally {
            setSaving(false);
        }
    };

    const clearFilters = () => {
        setStatusFilter("");
        setSearch("");
    };

    const totalEnquiries =
        enquiries.length;

    const newEnquiries =
        enquiries.filter(
            (item) =>
                item.status === "NEW"
        ).length;

    const inProgressEnquiries =
        enquiries.filter(
            (item) =>
                item.status === "IN_PROGRESS"
        ).length;

    const resolvedEnquiries =
        enquiries.filter(
            (item) =>
                item.status === "RESOLVED"
        ).length;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f6f1] text-[#26352b]">
            <AdminSidebar />

            <div className="min-w-0 lg:pl-64">
                <AdminMobileNav />

                <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <div className="mx-auto max-w-7xl min-w-0">
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-[#8b6f47]">
                                Administration
                            </p>

                            <div className="mt-1 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-semibold tracking-tight text-[#26352b] sm:text-3xl">
                                        Contact Enquiries
                                    </h1>

                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                                        Review and manage
                                        messages submitted
                                        through the public
                                        contact page.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        loadEnquiries
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl border border-[#d9d2c5] bg-white px-4 py-2.5 text-sm font-medium text-[#26352b] shadow-sm transition hover:bg-[#f7f3eb] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {loading
                                        ? "Refreshing..."
                                        : "Refresh"}
                                </button>
                            </div>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="mb-5 break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 break-words rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                                {success}
                            </div>
                        )}

                        {/* Summary */}
                        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <div className="min-w-0 rounded-2xl border border-[#e4ded3] bg-white p-4 shadow-sm sm:p-5">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                                    Total
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-[#26352b] sm:text-3xl">
                                    {totalEnquiries}
                                </p>
                            </div>

                            <div className="min-w-0 rounded-2xl border border-[#e4ded3] bg-white p-4 shadow-sm sm:p-5">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                                    New
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-blue-700 sm:text-3xl">
                                    {newEnquiries}
                                </p>
                            </div>

                            <div className="min-w-0 rounded-2xl border border-[#e4ded3] bg-white p-4 shadow-sm sm:p-5">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                                    In Progress
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-amber-700 sm:text-3xl">
                                    {inProgressEnquiries}
                                </p>
                            </div>

                            <div className="min-w-0 rounded-2xl border border-[#e4ded3] bg-white p-4 shadow-sm sm:p-5">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                                    Resolved
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-green-700 sm:text-3xl">
                                    {resolvedEnquiries}
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="mb-5 rounded-2xl border border-[#e4ded3] bg-white p-4 shadow-sm sm:p-5">
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_auto] lg:items-end">
                                <div className="min-w-0">
                                    <label
                                        htmlFor="enquiry-search"
                                        className="mb-1.5 block text-sm font-medium text-[#26352b]"
                                    >
                                        Search
                                    </label>

                                    <input
                                        id="enquiry-search"
                                        type="search"
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Search name, email or message..."
                                        className="min-h-11 w-full rounded-xl border border-[#d9d2c5] bg-[#fffdfa] px-4 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#78936f] focus:ring-2 focus:ring-[#78936f]/20"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label
                                        htmlFor="status-filter"
                                        className="mb-1.5 block text-sm font-medium text-[#26352b]"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="status-filter"
                                        value={
                                            statusFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusFilter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="min-h-11 w-full rounded-xl border border-[#d9d2c5] bg-[#fffdfa] px-4 py-2.5 text-sm outline-none transition focus:border-[#78936f] focus:ring-2 focus:ring-[#78936f]/20"
                                    >
                                        <option value="">
                                            All statuses
                                        </option>

                                        {ENQUIRY_STATUSES.map(
                                            (
                                                enquiryStatus
                                            ) => (
                                                <option
                                                    key={
                                                        enquiryStatus
                                                    }
                                                    value={
                                                        enquiryStatus
                                                    }
                                                >
                                                    {
                                                        STATUS_LABELS[
                                                            enquiryStatus
                                                        ]
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                    className="min-h-11 w-full rounded-xl border border-[#d9d2c5] bg-[#f7f3eb] px-4 py-2.5 text-sm font-medium text-[#5f5548] transition hover:bg-[#eee8dc] sm:w-auto"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Enquiries */}
                        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e4ded3] bg-white shadow-sm">
                            <div className="border-b border-[#ebe5da] px-4 py-4 sm:px-5">
                                <h2 className="text-base font-semibold text-[#26352b]">
                                    Submitted Enquiries
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-gray-500">
                                    Click an enquiry to
                                    view and manage its
                                    details.
                                </p>
                            </div>

                            {loading ? (
                                <div className="px-5 py-12 text-center">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d9d2c5] border-t-[#526b59]" />

                                    <p className="mt-3 text-sm text-gray-500">
                                        Loading enquiries...
                                    </p>
                                </div>
                            ) : enquiries.length ===
                              0 ? (
                                <div className="px-5 py-12 text-center sm:py-16">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f3efe7] text-xl">
                                        ✉
                                    </div>

                                    <h3 className="mt-4 text-base font-semibold text-[#26352b]">
                                        No enquiries
                                        found
                                    </h3>

                                    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
                                        There are no
                                        contact enquiries
                                        matching your
                                        current filters.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop / Tablet Table */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="min-w-[760px] w-full divide-y divide-[#ebe5da]">
                                            <thead className="bg-[#faf8f3]">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Sender
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Message
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Received
                                                    </th>

                                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-[#f0ebe2]">
                                                {enquiries.map(
                                                    (
                                                        enquiry
                                                    ) => (
                                                        <tr
                                                            key={
                                                                enquiry.id
                                                            }
                                                            className="transition hover:bg-[#fcfaf6]"
                                                        >
                                                            <td className="w-[22%] max-w-[240px] px-5 py-4 align-top">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9efe7] text-sm font-semibold text-[#526b59]">
                                                                        {getInitials(
                                                                            enquiry.full_name
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="break-words text-sm font-semibold text-[#26352b]">
                                                                            {
                                                                                enquiry.full_name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 break-all text-xs leading-5 text-gray-500">
                                                                            {
                                                                                enquiry.email
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="max-w-sm px-5 py-4 align-top">
                                                                <p className="line-clamp-3 break-words text-sm leading-5 text-gray-600">
                                                                    {
                                                                        enquiry.message
                                                                    }
                                                                </p>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4 align-top">
                                                                <span
                                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                                        enquiry.status
                                                                    )}`}
                                                                >
                                                                    {STATUS_LABELS[
                                                                        enquiry.status
                                                                    ] ||
                                                                        enquiry.status}
                                                                </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-gray-500">
                                                                {formatDate(
                                                                    enquiry.created_at
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-4 text-right align-top">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEnquiry(
                                                                            enquiry.id
                                                                        )
                                                                    }
                                                                    className="min-h-10 rounded-lg border border-[#d9d2c5] bg-white px-3 py-2 text-xs font-medium text-[#526b59] transition hover:bg-[#f5f1e9]"
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

                                    {/* Mobile Cards */}
                                    <div className="divide-y divide-[#ebe5da] md:hidden">
                                        {enquiries.map(
                                            (
                                                enquiry
                                            ) => (
                                                <button
                                                    key={
                                                        enquiry.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        openEnquiry(
                                                            enquiry.id
                                                        )
                                                    }
                                                    className="block w-full px-4 py-4 text-left transition hover:bg-[#fcfaf6] active:bg-[#f7f3eb]"
                                                >
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9efe7] text-sm font-semibold text-[#526b59]">
                                                            {getInitials(
                                                                enquiry.full_name
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex min-w-0 items-start justify-between gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="break-words text-sm font-semibold text-[#26352b]">
                                                                        {
                                                                            enquiry.full_name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-0.5 break-all text-xs leading-5 text-gray-500">
                                                                        {
                                                                            enquiry.email
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <span
                                                                    className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${getStatusClasses(
                                                                        enquiry.status
                                                                    )}`}
                                                                >
                                                                    {STATUS_LABELS[
                                                                        enquiry.status
                                                                    ] ||
                                                                        enquiry.status}
                                                                </span>
                                                            </div>

                                                            <p className="mt-3 line-clamp-3 break-words text-sm leading-5 text-gray-600">
                                                                {
                                                                    enquiry.message
                                                                }
                                                            </p>

                                                            <div className="mt-3 flex items-center justify-between gap-3">
                                                                <p className="min-w-0 text-xs text-gray-400">
                                                                    {formatDate(
                                                                        enquiry.created_at
                                                                    )}
                                                                </p>

                                                                <span className="shrink-0 text-xs font-semibold text-[#526b59]">
                                                                    View
                                                                    →
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Enquiry Details Modal */}
            {selectedEnquiry && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeEnquiry();
                        }
                    }}
                >
                    <div className="flex max-h-[94vh] w-full min-w-0 flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
                        {/* Modal Header */}
                        <div className="shrink-0 border-b border-[#ebe5da] bg-white px-4 py-4 sm:px-6">
                            <div className="flex min-w-0 items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-[#8b6f47]">
                                        Contact Enquiry
                                    </p>

                                    <h2 className="mt-1 break-words text-lg font-semibold text-[#26352b] sm:text-xl">
                                        {
                                            selectedEnquiry.full_name
                                        }
                                    </h2>

                                    <p className="mt-1 break-all text-sm leading-5 text-gray-500">
                                        {
                                            selectedEnquiry.email
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeEnquiry
                                    }
                                    disabled={
                                        saving
                                    }
                                    aria-label="Close enquiry"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ded7ca] text-lg text-gray-500 transition hover:bg-[#f7f3eb] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                            {loadingDetails ? (
                                <div className="py-10 text-center">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d9d2c5] border-t-[#526b59]" />

                                    <p className="mt-3 text-sm text-gray-500">
                                        Loading enquiry...
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Metadata */}
                                    <div className="grid gap-4 rounded-xl bg-[#faf8f3] p-4 sm:grid-cols-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Received
                                            </p>

                                            <p className="mt-1 break-words text-sm leading-5 text-[#26352b]">
                                                {formatDate(
                                                    selectedEnquiry.created_at
                                                )}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Last Updated
                                            </p>

                                            <p className="mt-1 break-words text-sm leading-5 text-[#26352b]">
                                                {formatDate(
                                                    selectedEnquiry.updated_at
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Message
                                        </p>

                                        <div className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-[#e4ded3] bg-[#faf8f3] p-4 text-sm leading-6 text-[#3f493f]">
                                            {
                                                selectedEnquiry.message
                                            }
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label
                                            htmlFor="edit-enquiry-status"
                                            className="mb-1.5 block text-sm font-medium text-[#26352b]"
                                        >
                                            Status
                                        </label>

                                        <select
                                            id="edit-enquiry-status"
                                            value={
                                                editStatus
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEditStatus(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="min-h-11 w-full rounded-xl border border-[#d9d2c5] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#78936f] focus:ring-2 focus:ring-[#78936f]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                                        >
                                            {ENQUIRY_STATUSES.map(
                                                (
                                                    enquiryStatus
                                                ) => (
                                                    <option
                                                        key={
                                                            enquiryStatus
                                                        }
                                                        value={
                                                            enquiryStatus
                                                        }
                                                    >
                                                        {
                                                            STATUS_LABELS[
                                                                enquiryStatus
                                                            ]
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    {/* Admin Notes */}
                                    <div>
                                        <label
                                            htmlFor="admin-notes"
                                            className="mb-1.5 block text-sm font-medium text-[#26352b]"
                                        >
                                            Admin Notes
                                        </label>

                                        <textarea
                                            id="admin-notes"
                                            value={
                                                adminNotes
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAdminNotes(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            rows={5}
                                            maxLength={
                                                10000
                                            }
                                            placeholder="Add internal notes about this enquiry..."
                                            className="w-full resize-y rounded-xl border border-[#d9d2c5] bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-[#78936f] focus:ring-2 focus:ring-[#78936f]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                                        />

                                        <p className="mt-1 text-right text-xs text-gray-400">
                                            {adminNotes.length.toLocaleString()}{" "}
                                            / 10,000
                                        </p>
                                    </div>

                                    {/* Resolved Information */}
                                    {selectedEnquiry.resolved_at && (
                                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                                Resolved
                                            </p>

                                            <p className="mt-1 break-words text-sm text-green-800">
                                                {formatDate(
                                                    selectedEnquiry.resolved_at
                                                )}
                                            </p>

                                            {selectedEnquiry.resolved_by_name && (
                                                <p className="mt-1 break-words text-xs text-green-700">
                                                    By{" "}
                                                    {
                                                        selectedEnquiry.resolved_by_name
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {!loadingDetails && (
                            <div className="shrink-0 border-t border-[#ebe5da] bg-white px-4 py-4 sm:px-6">
                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            closeEnquiry
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="min-h-11 w-full rounded-xl border border-[#d9d2c5] bg-white px-5 py-2.5 text-sm font-medium text-[#5f5548] transition hover:bg-[#f7f3eb] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleSave
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="min-h-11 w-full rounded-xl bg-[#526b59] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#435848] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";

import {
    getAdminItems,
    getAdminItem,
    getAdminItemMembers,
    createAdminItem,
    updateAdminItem,
    updateAdminItemStatus
} from "../../../services/adminApi";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

const ITEM_STATUSES = [
    {
        value: "",
        label: "All statuses"
    },
    {
        value: "ASSIGNED",
        label: "Assigned"
    },
    {
        value: "COLLECTED",
        label: "Collected"
    },
    {
        value: "CANCELLED",
        label: "Cancelled"
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

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeZone: "Africa/Lagos"
    }).format(date);
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos"
    }).format(date);
}

function getStatusLabel(status) {
    const item = ITEM_STATUSES.find(
        (entry) => entry.value === status
    );

    return item?.label || status || "Unknown";
}

function StatusBadge({ status }) {
    const classes = {
        ASSIGNED:
            "bg-amber-100 text-amber-800",
        COLLECTED:
            "bg-emerald-100 text-emerald-800",
        CANCELLED:
            "bg-slate-100 text-slate-700"
    };

    return (
        <span
            className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                classes[status] ||
                "bg-slate-100 text-slate-700"
            }`}
        >
            {getStatusLabel(status)}
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
                className={`flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl ${
                    wide
                        ? "sm:max-w-3xl"
                        : "sm:max-w-xl"
                }`}
            >
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
                    <h2 className="min-w-0 break-words text-base font-bold text-slate-900 sm:text-lg">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ onAssign }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:px-6 sm:py-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                📦
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
                No member items found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are no items matching the
                current search or filter.
            </p>

            <button
                type="button"
                onClick={onAssign}
                className="mt-5 min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-auto"
            >
                Assign Item
            </button>
        </div>
    );
}

export default function AdminItemsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");
    const [status, setStatus] =
        useState("");

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        });

    const [selectedItem, setSelectedItem] =
        useState(null);

    const [members, setMembers] =
        useState([]);

    const [membersLoading, setMembersLoading] =
        useState(false);

    const [showAssignModal, setShowAssignModal] =
        useState(false);

    const [showDetailsModal, setShowDetailsModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [showStatusModal, setShowStatusModal] =
        useState(false);

    const [formLoading, setFormLoading] =
        useState(false);

    const [formError, setFormError] =
        useState("");

    const [memberSearch, setMemberSearch] =
        useState("");

    const [form, setForm] = useState({
        memberId: "",
        itemName: "",
        itemDescription: "",
        quantity: 1,
        assignedAt: "",
        notes: ""
    });

    const [statusForm, setStatusForm] =
        useState({
            status: "",
            notes: ""
        });

    async function loadItems(page = 1) {
        try {
            setLoading(true);
            setError("");

            const data =
                await getAdminItems({
                    search,
                    status,
                    page,
                    limit: pagination.limit
                });

            setItems(data.items || []);

            setPagination(
                data.pagination || {
                    page,
                    limit: pagination.limit,
                    total: 0,
                    totalPages: 0
                }
            );
        } catch (err) {
            setError(
                err.message ||
                    "Unable to load member items."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function fetchItems() {
            try {
                setLoading(true);
                setError("");

                const data =
                    await getAdminItems({
                        search,
                        status,
                        page: 1,
                        limit: pagination.limit
                    });

                if (cancelled) {
                    return;
                }

                setItems(data.items || []);

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
                        "Unable to load member items."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        const timer = setTimeout(
            fetchItems,
            0
        );

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [
        search,
        status,
        pagination.limit
    ]);

    async function loadMembers(
        searchValue = ""
    ) {
        try {
            setMembersLoading(true);
            setFormError("");

            const data =
                await getAdminItemMembers({
                    search: searchValue,
                    limit: 50
                });

            setMembers(
                data.members || []
            );
        } catch (err) {
            setFormError(
                err.message ||
                    "Unable to load members."
            );
        } finally {
            setMembersLoading(false);
        }
    }

    function openAssignModal() {
        setForm({
            memberId: "",
            itemName: "",
            itemDescription: "",
            quantity: 1,
            assignedAt: "",
            notes: ""
        });

        setMemberSearch("");
        setFormError("");
        setShowAssignModal(true);

        loadMembers();
    }

    function closeAssignModal() {
        if (formLoading) {
            return;
        }

        setShowAssignModal(false);
        setFormError("");
    }

    function openEditModal(item) {
        setSelectedItem(item);

        setForm({
            memberId: item.member_id || "",
            itemName:
                item.item_name || "",
            itemDescription:
                item.item_description ||
                "",
            quantity:
                item.quantity || 1,
            assignedAt:
                item.assigned_at
                    ? new Date(
                          item.assigned_at
                      )
                          .toISOString()
                          .slice(0, 16)
                    : "",
            notes: item.notes || ""
        });

        setFormError("");
        setShowEditModal(true);
    }

    function openDetailsModal(item) {
        setSelectedItem(item);
        setShowDetailsModal(true);

        getAdminItem(item.id)
            .then((data) => {
                if (data.item) {
                    setSelectedItem(
                        data.item
                    );
                }
            })
            .catch(() => {
                // Keep the already-loaded
                // list item if details fail.
            });
    }

    function openStatusModal(item) {
        setSelectedItem(item);

        setStatusForm({
            status: item.status || "",
            notes: ""
        });

        setFormError("");
        setShowStatusModal(true);
    }

    async function handleAssign(event) {
        event.preventDefault();

        try {
            setFormLoading(true);
            setFormError("");

            await createAdminItem({
                memberId: form.memberId,
                itemName: form.itemName,
                itemDescription:
                    form.itemDescription ||
                    null,
                quantity:
                    Number(form.quantity),
                assignedAt:
                    form.assignedAt
                        ? new Date(
                              form.assignedAt
                          ).toISOString()
                        : null,
                notes:
                    form.notes || null
            });

            setShowAssignModal(false);

            await loadItems(1);
        } catch (err) {
            setFormError(
                err.message ||
                    "Unable to assign item."
            );
        } finally {
            setFormLoading(false);
        }
    }

    async function handleEdit(event) {
        event.preventDefault();

        if (!selectedItem) {
            return;
        }

        try {
            setFormLoading(true);
            setFormError("");

            await updateAdminItem(
                selectedItem.id,
                {
                    itemName: form.itemName,
                    itemDescription:
                        form.itemDescription ||
                        null,
                    quantity:
                        Number(form.quantity),
                    assignedAt:
                        form.assignedAt
                            ? new Date(
                                  form.assignedAt
                              ).toISOString()
                            : null,
                    notes:
                        form.notes || null
                }
            );

            setShowEditModal(false);

            await loadItems(
                pagination.page
            );
        } catch (err) {
            setFormError(
                err.message ||
                    "Unable to update item."
            );
        } finally {
            setFormLoading(false);
        }
    }

    async function handleStatusUpdate(
        event
    ) {
        event.preventDefault();

        if (!selectedItem) {
            return;
        }

        try {
            setFormLoading(true);
            setFormError("");

            await updateAdminItemStatus(
                selectedItem.id,
                statusForm.status,
                statusForm.notes ||
                    null
            );

            setShowStatusModal(false);

            await loadItems(
                pagination.page
            );
        } catch (err) {
            setFormError(
                err.message ||
                    "Unable to update item status."
            );
        } finally {
            setFormLoading(false);
        }
    }

    function renderMemberOption(member) {
        return (
            <button
                key={member.profile_id}
                type="button"
                onClick={() =>
                    setForm(
                        (current) => ({
                            ...current,
                            memberId:
                                member.profile_id
                        })
                    )
                }
                className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                    form.memberId ===
                    member.profile_id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                }`}
            >
                <div className="break-words font-semibold text-slate-900">
                    {member.full_name}
                </div>

                <div className="mt-1 break-words text-xs leading-5 text-slate-500">
                    {member.member_id ||
                        "No member ID"}
                    {" • "}
                    {member.phone ||
                        "No phone"}
                </div>
            </button>
        );
    }

    const inputClass =
        "mt-2 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

    const textareaClass =
        "mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

    const buttonBase =
        "min-h-11 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
            <AdminSidebar />

            <div className="min-w-0 lg:pl-64">
                <AdminMobileNav />

                <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                                    Member Items
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                    Manage items assigned
                                    to members and
                                    preserve collection
                                    history.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    openAssignModal
                                }
                                className={`${buttonBase} w-full shrink-0 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 sm:w-auto`}
                            >
                                Assign Item
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
                                <input
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
                                    placeholder="Search member, phone, email, member ID or item..."
                                    className={inputClass.replace(
                                        "mt-2 ",
                                        ""
                                    )}
                                    aria-label="Search member items"
                                />

                                <select
                                    value={
                                        status
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setStatus(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className={inputClass.replace(
                                        "mt-2 ",
                                        ""
                                    )}
                                    aria-label="Filter item status"
                                >
                                    {ITEM_STATUSES.map(
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

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadItems(
                                            1
                                        )
                                    }
                                    className={`${buttonBase} w-full border border-slate-300 text-slate-700 hover:bg-slate-50 lg:w-auto`}
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="break-words text-sm font-medium leading-6 text-red-800">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadItems(
                                            pagination.page
                                        )
                                    }
                                    className={`${buttonBase} mt-3 bg-red-700 px-3 text-white hover:bg-red-800`}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="mt-5">
                            {loading ? (
                                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center sm:px-6">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-700" />

                                    <p className="mt-4 text-sm text-slate-500">
                                        Loading member
                                        items...
                                    </p>
                                </div>
                            ) : items.length ===
                              0 ? (
                                <EmptyState
                                    onAssign={
                                        openAssignModal
                                    }
                                />
                            ) : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-[900px] w-full divide-y divide-slate-200">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Member
                                                        </th>

                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Item
                                                        </th>

                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Quantity
                                                        </th>

                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Status
                                                        </th>

                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Assigned
                                                        </th>

                                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-slate-200">
                                                    {items.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    item.id
                                                                }
                                                                className="hover:bg-slate-50"
                                                            >
                                                                <td className="max-w-[220px] px-5 py-4">
                                                                    <div className="break-words font-semibold text-slate-900">
                                                                        {
                                                                            item.member_name
                                                                        }
                                                                    </div>

                                                                    <div className="mt-1 break-words text-xs text-slate-500">
                                                                        {
                                                                            item.member_code
                                                                        }
                                                                    </div>
                                                                </td>

                                                                <td className="max-w-[260px] px-5 py-4">
                                                                    <div className="break-words font-medium text-slate-900">
                                                                        {
                                                                            item.item_name
                                                                        }
                                                                    </div>

                                                                    {item.item_description && (
                                                                        <div className="mt-1 truncate text-xs text-slate-500">
                                                                            {
                                                                                item.item_description
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </td>

                                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <StatusBadge
                                                                        status={
                                                                            item.status
                                                                        }
                                                                    />
                                                                </td>

                                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                                    {formatDate(
                                                                        item.assigned_at
                                                                    )}
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openDetailsModal(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                                        >
                                                                            View
                                                                        </button>

                                                                        {item.status ===
                                                                            "ASSIGNED" && (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        openEditModal(
                                                                                            item
                                                                                        )
                                                                                    }
                                                                                    className="min-h-10 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                                                                >
                                                                                    Edit
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        openStatusModal(
                                                                                            item
                                                                                        )
                                                                                    }
                                                                                    className="min-h-10 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                                                                                >
                                                                                    Update
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Mobile / tablet cards */}
                                    <div className="space-y-3 lg:hidden">
                                        {items.map(
                                            (
                                                item
                                            ) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                                                >
                                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h3 className="break-words text-base font-semibold text-slate-900">
                                                                {
                                                                    item.item_name
                                                                }
                                                            </h3>

                                                            <p className="mt-1 break-words text-sm text-slate-500">
                                                                {
                                                                    item.member_name
                                                                }
                                                            </p>

                                                            <p className="break-words text-xs text-slate-400">
                                                                {
                                                                    item.member_code
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0">
                                                            <StatusBadge
                                                                status={
                                                                    item.status
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {item.item_description && (
                                                        <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                                            <p className="text-xs font-medium text-slate-400">
                                                                Description
                                                            </p>

                                                            <p className="mt-1 break-words text-sm leading-5 text-slate-700">
                                                                {
                                                                    item.item_description
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-400">
                                                                Quantity
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium text-slate-800">
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-400">
                                                                Assigned
                                                            </p>

                                                            <p className="mt-1 break-words text-sm font-medium text-slate-800">
                                                                {formatDate(
                                                                    item.assigned_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDetailsModal(
                                                                    item
                                                                )
                                                            }
                                                            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                                                        >
                                                            View Details
                                                        </button>

                                                        {item.status ===
                                                            "ASSIGNED" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="min-h-11 w-full rounded-lg border border-emerald-200 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openStatusModal(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="min-h-11 w-full rounded-lg bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:w-auto"
                                                                >
                                                                    Update
                                                                    Status
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {pagination.totalPages >
                                        1 && (
                                        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm text-slate-500">
                                                Showing page{" "}
                                                <span className="font-semibold text-slate-700">
                                                    {
                                                        pagination.page
                                                    }
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-semibold text-slate-700">
                                                    {
                                                        pagination.totalPages
                                                    }
                                                </span>
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 sm:flex">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        pagination.page <=
                                                        1
                                                    }
                                                    onClick={() =>
                                                        loadItems(
                                                            pagination.page -
                                                                1
                                                        )
                                                    }
                                                    className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Previous
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        pagination.page >=
                                                        pagination.totalPages
                                                    }
                                                    onClick={() =>
                                                        loadItems(
                                                            pagination.page +
                                                                1
                                                        )
                                                    }
                                                    className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Assign Item Modal */}
            {showAssignModal && (
                <Modal
                    title="Assign Item"
                    onClose={
                        closeAssignModal
                    }
                    wide
                >
                    <form
                        onSubmit={
                            handleAssign
                        }
                    >
                        {formError && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
                                {formError}
                            </div>
                        )}

                        <div className="grid gap-5 lg:grid-cols-2">
                            <div className="min-w-0">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Member
                                </label>

                                <input
                                    type="search"
                                    value={
                                        memberSearch
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        const value =
                                            event
                                                .target
                                                .value;

                                        setMemberSearch(
                                            value
                                        );

                                        loadMembers(
                                            value
                                        );
                                    }}
                                    placeholder="Search member..."
                                    className={inputClass}
                                />

                                <div className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-lg">
                                    {membersLoading ? (
                                        <p className="py-4 text-center text-sm text-slate-500">
                                            Loading
                                            members...
                                        </p>
                                    ) : members.length ===
                                      0 ? (
                                        <p className="py-4 text-center text-sm text-slate-500">
                                            No members
                                            found.
                                        </p>
                                    ) : (
                                        members.map(
                                            renderMemberOption
                                        )
                                    )}
                                </div>

                                {form.memberId && (
                                    <p className="mt-2 text-xs font-medium text-emerald-700">
                                        Member selected
                                    </p>
                                )}
                            </div>

                            <div className="min-w-0 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Item Name
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={
                                            form.itemName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    itemName:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={
                                            form.quantity
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    quantity:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Assigned At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            form.assignedAt
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    assignedAt:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="block text-sm font-semibold text-slate-700">
                                Description
                            </label>

                            <textarea
                                rows="3"
                                value={
                                    form.itemDescription
                                }
                                onChange={(
                                    event
                                ) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            itemDescription:
                                                event
                                                    .target
                                                    .value
                                        })
                                    )
                                }
                                className={textareaClass}
                            />
                        </div>

                        <div className="mt-5">
                            <label className="block text-sm font-semibold text-slate-700">
                                Notes
                            </label>

                            <textarea
                                rows="3"
                                value={
                                    form.notes
                                }
                                onChange={(
                                    event
                                ) =>
                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            notes:
                                                event
                                                    .target
                                                    .value
                                        })
                                    )
                                }
                                className={textareaClass}
                            />
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-2 sm:flex sm:justify-end">
                            <button
                                type="button"
                                onClick={
                                    closeAssignModal
                                }
                                disabled={
                                    formLoading
                                }
                                className={`${buttonBase} w-full border border-slate-300 text-slate-700 hover:bg-slate-50 sm:w-auto`}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    formLoading ||
                                    !form.memberId
                                }
                                className={`${buttonBase} w-full bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto`}
                            >
                                {formLoading
                                    ? "Assigning..."
                                    : "Assign Item"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Details Modal */}
            {showDetailsModal &&
                selectedItem && (
                    <Modal
                        title="Item Details"
                        onClose={() =>
                            setShowDetailsModal(
                                false
                            )
                        }
                    >
                        <div className="space-y-5">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Item
                                </p>

                                <p className="mt-1 break-words text-lg font-bold text-slate-900">
                                    {
                                        selectedItem.item_name
                                    }
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400">
                                        Member
                                    </p>

                                    <p className="mt-1 break-words font-semibold text-slate-800">
                                        {
                                            selectedItem.member_name
                                        }
                                    </p>

                                    <p className="break-words text-xs text-slate-500">
                                        {
                                            selectedItem.member_code
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Status
                                    </p>

                                    <div className="mt-1">
                                        <StatusBadge
                                            status={
                                                selectedItem.status
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Quantity
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {
                                            selectedItem.quantity
                                        }
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400">
                                        Assigned
                                    </p>

                                    <p className="mt-1 break-words text-sm text-slate-700">
                                        {formatDateTime(
                                            selectedItem.assigned_at
                                        )}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400">
                                        Collected
                                    </p>

                                    <p className="mt-1 break-words text-sm text-slate-700">
                                        {formatDateTime(
                                            selectedItem.collected_at
                                        )}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400">
                                        Member Phone
                                    </p>

                                    <p className="mt-1 break-words text-sm text-slate-700">
                                        {selectedItem.member_phone ||
                                            "—"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Description
                                </p>

                                <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {selectedItem.item_description ||
                                        "No description provided."}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Notes
                                </p>

                                <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {selectedItem.notes ||
                                        "No notes."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:flex sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDetailsModal(
                                            false
                                        )
                                    }
                                    className={`${buttonBase} w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

            {/* Edit Modal */}
            {showEditModal &&
                selectedItem && (
                    <Modal
                        title="Edit Assigned Item"
                        onClose={() => {
                            if (
                                !formLoading
                            ) {
                                setShowEditModal(
                                    false
                                );
                            }
                        }}
                    >
                        <form
                            onSubmit={
                                handleEdit
                            }
                        >
                            {formError && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Item Name
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={
                                            form.itemName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    itemName:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={
                                            form.quantity
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    quantity:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Assigned At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            form.assignedAt
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    assignedAt:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        rows="3"
                                        value={
                                            form.itemDescription
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    itemDescription:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={textareaClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Notes
                                    </label>

                                    <textarea
                                        rows="3"
                                        value={
                                            form.notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    notes:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={textareaClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-2 sm:flex sm:justify-end">
                                <button
                                    type="button"
                                    disabled={
                                        formLoading
                                    }
                                    onClick={() =>
                                        setShowEditModal(
                                            false
                                        )
                                    }
                                    className={`${buttonBase} w-full border border-slate-300 text-slate-700 hover:bg-slate-50 sm:w-auto`}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        formLoading
                                    }
                                    className={`${buttonBase} w-full bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto`}
                                >
                                    {formLoading
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

            {/* Status Modal */}
            {showStatusModal &&
                selectedItem && (
                    <Modal
                        title="Update Item Status"
                        onClose={() => {
                            if (
                                !formLoading
                            ) {
                                setShowStatusModal(
                                    false
                                );
                            }
                        }}
                    >
                        <form
                            onSubmit={
                                handleStatusUpdate
                            }
                        >
                            {formError && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <p className="break-words text-sm leading-6 text-slate-600">
                                    Update the status
                                    for{" "}
                                    <span className="font-semibold text-slate-900">
                                        {
                                            selectedItem.item_name
                                        }
                                    </span>
                                    .
                                </p>

                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        required
                                        value={
                                            statusForm.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    status:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select
                                            status
                                        </option>

                                        <option value="ASSIGNED">
                                            Assigned
                                        </option>

                                        <option value="COLLECTED">
                                            Collected
                                        </option>

                                        <option value="CANCELLED">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Notes
                                    </label>

                                    <textarea
                                        rows="3"
                                        value={
                                            statusForm.notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    notes:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                        className={textareaClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-2 sm:flex sm:justify-end">
                                <button
                                    type="button"
                                    disabled={
                                        formLoading
                                    }
                                    onClick={() =>
                                        setShowStatusModal(
                                            false
                                        )
                                    }
                                    className={`${buttonBase} w-full border border-slate-300 text-slate-700 hover:bg-slate-50 sm:w-auto`}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        formLoading ||
                                        !statusForm.status
                                    }
                                    className={`${buttonBase} w-full bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto`}
                                >
                                    {formLoading
                                        ? "Updating..."
                                        : "Update Status"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
        </div>
    );
}
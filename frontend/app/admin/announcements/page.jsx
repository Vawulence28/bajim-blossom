"use client";

import {
    useCallback,
    useEffect,
    useState
} from "react";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

import {
    getAdminAnnouncements,
    createAdminAnnouncement,
    updateAdminAnnouncement,
    updateAdminAnnouncementStatus
} from "../../../services/adminApi";

const CATEGORIES = [
    {
        value: "GENERAL",
        label: "General"
    },
    {
        value: "CONTRIBUTION",
        label: "Contribution"
    },
    {
        value: "PAYMENT",
        label: "Payment"
    },
    {
        value: "MEETING",
        label: "Meeting"
    },
    {
        value: "ITEMS",
        label: "Items"
    },
    {
        value: "IMPORTANT",
        label: "Important"
    }
];

const STATUSES = [
    {
        value: "",
        label: "All statuses"
    },
    {
        value: "DRAFT",
        label: "Draft"
    },
    {
        value: "PUBLISHED",
        label: "Published"
    },
    {
        value: "ARCHIVED",
        label: "Archived"
    }
];

const PAGE_SIZE = 10;

const EMPTY_FORM = {
    title: "",
    content: "",
    category: "GENERAL"
};

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}

function getStatusClasses(status) {
    if (status === "PUBLISHED") {
        return "bg-green-100 text-green-800";
    }

    if (status === "ARCHIVED") {
        return "bg-stone-200 text-stone-700";
    }

    return "bg-amber-100 text-amber-800";
}

function getCategoryClasses(category) {
    if (category === "IMPORTANT") {
        return "bg-red-50 text-red-700";
    }

    if (category === "PAYMENT") {
        return "bg-blue-50 text-blue-700";
    }

    if (category === "CONTRIBUTION") {
        return "bg-green-50 text-green-700";
    }

    if (category === "MEETING") {
        return "bg-purple-50 text-purple-700";
    }

    if (category === "ITEMS") {
        return "bg-orange-50 text-orange-700";
    }

    return "bg-stone-100 text-stone-700";
}

function formatCategory(category) {
    return (
        CATEGORIES.find(
            (item) =>
                item.value === category
        )?.label ||
        category
    );
}

function formatStatus(status) {
    return (
        status
            ?.toLowerCase()
            .replace(
                /^./,
                (character) =>
                    character.toUpperCase()
            ) || "Unknown"
    );
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] =
        useState([]);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0
        });

    const [search, setSearch] =
        useState("");

    const [searchInput, setSearchInput] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingAnnouncement, setEditingAnnouncement] =
        useState(null);

    const [viewingAnnouncement, setViewingAnnouncement] =
        useState(null);

    const [form, setForm] =
        useState(EMPTY_FORM);

    const [saving, setSaving] =
        useState(false);

    const [actionId, setActionId] =
        useState(null);

    const loadAnnouncements =
        useCallback(
            async (requestedPage) => {
                try {
                    await Promise.resolve();

                    setLoading(true);
                    setError("");

                    const response =
                        await getAdminAnnouncements({
                            search,
                            status,
                            category,
                            page:
                                requestedPage,
                            limit:
                                PAGE_SIZE
                        });

                    setAnnouncements(
                        response.announcements ||
                            []
                    );

                    setPagination(
                        response.pagination ||
                            {
                                page:
                                    requestedPage,
                                limit:
                                    PAGE_SIZE,
                                total: 0,
                                totalPages: 0
                            }
                    );
                } catch (err) {
                    setError(
                        err.message ||
                            "Unable to load announcements."
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                search,
                status,
                category
            ]
        );

    useEffect(() => {
        let cancelled = false;

        async function loadInitialAnnouncements() {
            await Promise.resolve();

            if (cancelled) {
                return;
            }

            await loadAnnouncements(1);
        }

        loadInitialAnnouncements();

        return () => {
            cancelled = true;
        };
    }, [
        loadAnnouncements
    ]);

    function handleSearchSubmit(
        event
    ) {
        event.preventDefault();

        setSearch(
            searchInput.trim()
        );
    }

    function openCreateForm() {
        setEditingAnnouncement(null);
        setForm(EMPTY_FORM);
        setError("");
        setSuccessMessage("");
        setShowForm(true);
    }

    function openEditForm(
        announcement
    ) {
        setEditingAnnouncement(
            announcement
        );

        setForm({
            title:
                announcement.title ||
                "",
            content:
                announcement.content ||
                "",
            category:
                announcement.category ||
                "GENERAL"
        });

        setViewingAnnouncement(null);
        setError("");
        setSuccessMessage("");
        setShowForm(true);
    }

    function closeForm() {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingAnnouncement(null);
        setForm(EMPTY_FORM);
    }

    function handleFormChange(
        event
    ) {
        const {
            name,
            value
        } = event.target;

        setForm(
            (current) => ({
                ...current,
                [name]: value
            })
        );
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (
            !form.title.trim()
        ) {
            setError(
                "Please enter an announcement title."
            );
            return;
        }

        if (
            !form.content.trim()
        ) {
            setError(
                "Please enter announcement content."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            if (
                editingAnnouncement
            ) {
                await updateAdminAnnouncement(
                    editingAnnouncement.id,
                    {
                        title:
                            form.title.trim(),
                        content:
                            form.content.trim(),
                        category:
                            form.category
                    }
                );

                setSuccessMessage(
                    "Announcement updated successfully."
                );
            } else {
                await createAdminAnnouncement(
                    {
                        title:
                            form.title.trim(),
                        content:
                            form.content.trim(),
                        category:
                            form.category
                    }
                );

                setSuccessMessage(
                    "Announcement created successfully."
                );
            }

            closeForm();

            await loadAnnouncements(
                editingAnnouncement
                    ? pagination.page
                    : 1
            );
        } catch (err) {
            setError(
                err.message ||
                    "Unable to save announcement."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleStatusChange(
        announcement,
        nextStatus
    ) {
        const confirmed =
            window.confirm(
                `Are you sure you want to ${nextStatus.toLowerCase()} this announcement?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setActionId(
                announcement.id
            );

            setError("");
            setSuccessMessage("");

            await updateAdminAnnouncementStatus(
                announcement.id,
                nextStatus
            );

            setSuccessMessage(
                `Announcement ${nextStatus.toLowerCase()} successfully.`
            );

            await loadAnnouncements(
                pagination.page
            );

            if (
                viewingAnnouncement?.id ===
                announcement.id
            ) {
                setViewingAnnouncement(
                    null
                );
            }
        } catch (err) {
            setError(
                err.message ||
                    "Unable to update announcement status."
            );
        } finally {
            setActionId(null);
        }
    }

    function openDetails(
        announcement
    ) {
        setViewingAnnouncement(
            announcement
        );

        setShowForm(false);
        setError("");
    }

    function closeDetails() {
        setViewingAnnouncement(
            null
        );
    }

    function goToPage(
        nextPage
    ) {
        if (
            nextPage < 1 ||
            nextPage >
                pagination.totalPages
        ) {
            return;
        }

        loadAnnouncements(
            nextPage
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
            <AdminSidebar />

            <div className="min-w-0 lg:pl-64">
                <AdminMobileNav />

                <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="mx-auto min-w-0 max-w-7xl">
                        {/* Header */}
                        <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="mb-1 text-sm font-medium text-green-700">
                                    Admin Management
                                </p>

                                <h1 className="break-words text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                                    Announcements
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                                    Create, publish and manage
                                    announcements for BAJIM
                                    members.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    openCreateForm
                                }
                                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 sm:w-auto"
                            >
                                <span className="mr-2 text-lg leading-none">
                                    +
                                </span>
                                New Announcement
                            </button>
                        </div>

                        {/* Alerts */}
                        {successMessage && (
                            <div className="mb-5 break-words rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="mb-5 break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                                {error}
                            </div>
                        )}

                        {/* Filters */}
                        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                            <form
                                onSubmit={
                                    handleSearchSubmit
                                }
                                className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_12rem_12rem]"
                            >
                                <div className="min-w-0">
                                    <label
                                        htmlFor="announcement-search"
                                        className="sr-only"
                                    >
                                        Search announcements
                                    </label>

                                    <input
                                        id="announcement-search"
                                        type="search"
                                        value={
                                            searchInput
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearchInput(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search title or content..."
                                        className="min-h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="min-h-11 rounded-xl border border-green-700 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                                >
                                    Search
                                </button>

                                <select
                                    value={status}
                                    onChange={(
                                        event
                                    ) =>
                                        setStatus(
                                            event.target.value
                                        )
                                    }
                                    className="min-h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                >
                                    {STATUSES.map(
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

                                <select
                                    value={category}
                                    onChange={(
                                        event
                                    ) =>
                                        setCategory(
                                            event.target.value
                                        )
                                    }
                                    className="min-h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                >
                                    <option value="">
                                        All categories
                                    </option>

                                    {CATEGORIES.map(
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
                            </form>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                            {loading ? (
                                <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
                                    {[
                                        1,
                                        2,
                                        3,
                                        4
                                    ].map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                key={
                                                    item
                                                }
                                                className="animate-pulse rounded-xl border border-stone-100 p-4 sm:p-5"
                                            >
                                                <div className="mb-3 h-5 w-3/4 max-w-md rounded bg-stone-200" />
                                                <div className="mb-2 h-4 w-1/2 max-w-sm rounded bg-stone-200" />
                                                <div className="h-4 w-full rounded bg-stone-100" />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : announcements.length ===
                              0 ? (
                                <div className="px-5 py-14 text-center sm:px-6 sm:py-16">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl">
                                        📢
                                    </div>

                                    <h2 className="text-lg font-semibold text-stone-900">
                                        No announcements found
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                                        There are no announcements
                                        matching your current
                                        filters.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            openCreateForm
                                        }
                                        className="mt-5 min-h-11 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
                                    >
                                        Create Announcement
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b border-stone-200 bg-stone-50">
                                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                                                        Announcement
                                                    </th>

                                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                                                        Category
                                                    </th>

                                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                                                        Created
                                                    </th>

                                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-stone-500">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-stone-100">
                                                {announcements.map(
                                                    (
                                                        announcement
                                                    ) => (
                                                        <tr
                                                            key={
                                                                announcement.id
                                                            }
                                                            className="transition hover:bg-stone-50"
                                                        >
                                                            <td className="max-w-md px-5 py-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openDetails(
                                                                            announcement
                                                                        )
                                                                    }
                                                                    className="min-w-0 text-left"
                                                                >
                                                                    <p className="break-words font-semibold text-stone-900 hover:text-green-700">
                                                                        {
                                                                            announcement.title
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-stone-500">
                                                                        {
                                                                            announcement.content
                                                                        }
                                                                    </p>
                                                                </button>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getCategoryClasses(
                                                                        announcement.category
                                                                    )}`}
                                                                >
                                                                    {formatCategory(
                                                                        announcement.category
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                                        announcement.status
                                                                    )}`}
                                                                >
                                                                    {formatStatus(
                                                                        announcement.status
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-stone-500">
                                                                {formatDate(
                                                                    announcement.created_at
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex flex-wrap justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openDetails(
                                                                                announcement
                                                                            )
                                                                        }
                                                                        className="min-h-9 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                                                                    >
                                                                        View
                                                                    </button>

                                                                    {announcement.status !==
                                                                        "ARCHIVED" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openEditForm(
                                                                                    announcement
                                                                                )
                                                                            }
                                                                            className="min-h-9 rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    )}

                                                                    {announcement.status ===
                                                                        "DRAFT" && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                actionId ===
                                                                                announcement.id
                                                                            }
                                                                            onClick={() =>
                                                                                handleStatusChange(
                                                                                    announcement,
                                                                                    "PUBLISHED"
                                                                                )
                                                                            }
                                                                            className="min-h-9 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                            {actionId ===
                                                                            announcement.id
                                                                                ? "..."
                                                                                : "Publish"}
                                                                        </button>
                                                                    )}

                                                                    {announcement.status ===
                                                                        "PUBLISHED" && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                actionId ===
                                                                                announcement.id
                                                                            }
                                                                            onClick={() =>
                                                                                handleStatusChange(
                                                                                    announcement,
                                                                                    "ARCHIVED"
                                                                                )
                                                                            }
                                                                            className="min-h-9 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                            {actionId ===
                                                                            announcement.id
                                                                                ? "..."
                                                                                : "Archive"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile / tablet cards */}
                                    <div className="divide-y divide-stone-100 lg:hidden">
                                        {announcements.map(
                                            (
                                                announcement
                                            ) => (
                                                <article
                                                    key={
                                                        announcement.id
                                                    }
                                                    className="min-w-0 p-4 sm:p-5"
                                                >
                                                    <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
                                                        <span
                                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                                announcement.status
                                                            )}`}
                                                        >
                                                            {formatStatus(
                                                                announcement.status
                                                            )}
                                                        </span>

                                                        <span
                                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getCategoryClasses(
                                                                announcement.category
                                                            )}`}
                                                        >
                                                            {formatCategory(
                                                                announcement.category
                                                            )}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDetails(
                                                                announcement
                                                            )
                                                        }
                                                        className="block min-w-0 max-w-full text-left"
                                                    >
                                                        <h2 className="break-words font-semibold leading-6 text-stone-900">
                                                            {
                                                                announcement.title
                                                            }
                                                        </h2>

                                                        <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-stone-500">
                                                            {
                                                                announcement.content
                                                            }
                                                        </p>
                                                    </button>

                                                    <div className="mt-4 flex min-w-0 flex-col gap-3">
                                                        <p className="break-words text-xs text-stone-400">
                                                            Created{" "}
                                                            {formatDate(
                                                                announcement.created_at
                                                            )}
                                                        </p>

                                                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDetails(
                                                                        announcement
                                                                    )
                                                                }
                                                                className="min-h-10 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                                                            >
                                                                View
                                                            </button>

                                                            {announcement.status !==
                                                                "ARCHIVED" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditForm(
                                                                            announcement
                                                                        )
                                                                    }
                                                                    className="min-h-10 rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700"
                                                                >
                                                                    Edit
                                                                </button>
                                                            )}

                                                            {announcement.status ===
                                                                "DRAFT" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        actionId ===
                                                                        announcement.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            announcement,
                                                                            "PUBLISHED"
                                                                        )
                                                                    }
                                                                    className="min-h-10 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {actionId ===
                                                                    announcement.id
                                                                        ? "..."
                                                                        : "Publish"}
                                                                </button>
                                                            )}

                                                            {announcement.status ===
                                                                "PUBLISHED" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        actionId ===
                                                                        announcement.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            announcement,
                                                                            "ARCHIVED"
                                                                        )
                                                                    }
                                                                    className="min-h-10 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {actionId ===
                                                                    announcement.id
                                                                        ? "..."
                                                                        : "Archive"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </article>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Pagination */}
                            {!loading &&
                                pagination.totalPages >
                                    1 && (
                                    <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                        <p className="text-sm text-stone-500">
                                            Showing page{" "}
                                            <span className="font-semibold text-stone-700">
                                                {
                                                    pagination.page
                                                }
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-semibold text-stone-700">
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
                                                    goToPage(
                                                        pagination.page -
                                                            1
                                                    )
                                                }
                                                className="min-h-10 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                                                    goToPage(
                                                        pagination.page +
                                                            1
                                                    )
                                                }
                                                className="min-h-10 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
                    <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-200 px-4 py-4 sm:px-6">
                            <div className="min-w-0">
                                <h2 className="break-words text-lg font-bold text-stone-900">
                                    {editingAnnouncement
                                        ? "Edit Announcement"
                                        : "New Announcement"}
                                </h2>

                                <p className="mt-1 break-words text-sm leading-5 text-stone-500">
                                    {editingAnnouncement
                                        ? "Update the announcement details."
                                        : "Create a draft announcement. You can publish it afterwards."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="space-y-5 p-4 sm:p-6"
                            >
                                <div>
                                    <label
                                        htmlFor="announcement-title"
                                        className="mb-2 block text-sm font-semibold text-stone-700"
                                    >
                                        Title
                                    </label>

                                    <input
                                        id="announcement-title"
                                        name="title"
                                        type="text"
                                        maxLength={255}
                                        value={
                                            form.title
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter announcement title"
                                        className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="announcement-category"
                                        className="mb-2 block text-sm font-semibold text-stone-700"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="announcement-category"
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    >
                                        {CATEGORIES.map(
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

                                <div>
                                    <label
                                        htmlFor="announcement-content"
                                        className="mb-2 block text-sm font-semibold text-stone-700"
                                    >
                                        Content
                                    </label>

                                    <textarea
                                        id="announcement-content"
                                        name="content"
                                        rows={8}
                                        value={
                                            form.content
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Write the announcement..."
                                        className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm leading-6 text-stone-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            closeForm
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="min-h-11 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            saving
                                        }
                                        className="min-h-11 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingAnnouncement
                                            ? "Save Changes"
                                            : "Create Draft"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {viewingAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
                    <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
                        <div className="shrink-0 border-b border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="mb-3 flex min-w-0 flex-wrap gap-2">
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                viewingAnnouncement.status
                                            )}`}
                                        >
                                            {formatStatus(
                                                viewingAnnouncement.status
                                            )}
                                        </span>

                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getCategoryClasses(
                                                viewingAnnouncement.category
                                            )}`}
                                        >
                                            {formatCategory(
                                                viewingAnnouncement.category
                                            )}
                                        </span>
                                    </div>

                                    <h2 className="break-words text-xl font-bold leading-7 text-stone-900 sm:text-2xl">
                                        {
                                            viewingAnnouncement.title
                                        }
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDetails
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <div className="space-y-5 p-4 sm:p-6">
                                <div className="break-words whitespace-pre-wrap text-sm leading-7 text-stone-700">
                                    {
                                        viewingAnnouncement.content
                                    }
                                </div>

                                <div className="grid gap-3 rounded-xl bg-stone-50 p-4 sm:grid-cols-2 sm:gap-4">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                                            Created by
                                        </p>

                                        <p className="mt-1 break-words text-sm font-medium text-stone-700">
                                            {viewingAnnouncement.creator_name ||
                                                "—"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                                            Created
                                        </p>

                                        <p className="mt-1 break-words text-sm font-medium text-stone-700">
                                            {formatDate(
                                                viewingAnnouncement.created_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                                            Published
                                        </p>

                                        <p className="mt-1 break-words text-sm font-medium text-stone-700">
                                            {formatDate(
                                                viewingAnnouncement.published_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                                            Last updated
                                        </p>

                                        <p className="mt-1 break-words text-sm font-medium text-stone-700">
                                            {formatDate(
                                                viewingAnnouncement.updated_at
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border-t border-stone-100 pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
                                    {viewingAnnouncement.status !==
                                        "ARCHIVED" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditForm(
                                                    viewingAnnouncement
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl border border-green-200 px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 sm:w-auto"
                                        >
                                            Edit
                                        </button>
                                    )}

                                    {viewingAnnouncement.status ===
                                        "DRAFT" && (
                                        <button
                                            type="button"
                                            disabled={
                                                actionId ===
                                                viewingAnnouncement.id
                                            }
                                            onClick={() =>
                                                handleStatusChange(
                                                    viewingAnnouncement,
                                                    "PUBLISHED"
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                        >
                                            {actionId ===
                                            viewingAnnouncement.id
                                                ? "Publishing..."
                                                : "Publish"}
                                        </button>
                                    )}

                                    {viewingAnnouncement.status ===
                                        "PUBLISHED" && (
                                        <button
                                            type="button"
                                            disabled={
                                                actionId ===
                                                viewingAnnouncement.id
                                            }
                                            onClick={() =>
                                                handleStatusChange(
                                                    viewingAnnouncement,
                                                    "ARCHIVED"
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                        >
                                            {actionId ===
                                            viewingAnnouncement.id
                                                ? "Archiving..."
                                                : "Archive"}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={
                                            closeDetails
                                        }
                                        className="min-h-11 w-full rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 sm:w-auto"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
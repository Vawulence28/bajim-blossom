"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

import {
    getActivityLogs,
    getActivityLog
} from "../../../services/activityApi";

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SIZE = 20;

const ACTION_OPTIONS = [
    {
        value: "",
        label: "All actions"
    },
    {
        value: "PAYMENT_RECORDED",
        label: "Payment recorded"
    },
    {
        value: "PAYMENT_STATUS_CHANGED",
        label: "Payment status changed"
    },
    {
        value: "FINE_APPLIED",
        label: "Fine applied"
    },
    {
        value: "FINE_UPDATED",
        label: "Fine updated"
    },
    {
        value: "FINE_STATUS_CHANGED",
        label: "Fine status changed"
    },
    {
        value: "ITEM_ASSIGNED",
        label: "Item assigned"
    },
    {
        value: "ITEM_UPDATED",
        label: "Item updated"
    },
    {
        value: "ITEM_STATUS_CHANGED",
        label: "Item status changed"
    },
    {
        value: "ANNOUNCEMENT_CREATED",
        label: "Announcement created"
    },
    {
        value: "ANNOUNCEMENT_UPDATED",
        label: "Announcement updated"
    },
    {
        value: "ANNOUNCEMENT_PUBLISHED",
        label: "Announcement published"
    },
    {
        value: "ANNOUNCEMENT_ARCHIVED",
        label: "Announcement archived"
    },
    {
        value: "ANNOUNCEMENT_STATUS_CHANGED",
        label: "Announcement status changed"
    }
];

const ENTITY_OPTIONS = [
    {
        value: "",
        label: "All entities"
    },
    {
        value: "PAYMENT",
        label: "Payment"
    },
    {
        value: "FINE",
        label: "Fine"
    },
    {
        value: "MEMBER_ITEM",
        label: "Member item"
    },
    {
        value: "ANNOUNCEMENT",
        label: "Announcement"
    }
];

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(value) {
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

function formatAction(action) {
    if (!action) {
        return "—";
    }

    return action
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

function formatEntityType(value) {
    if (!value) {
        return "—";
    }

    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

function formatMetadata(metadata) {
    if (
        metadata === null ||
        metadata === undefined
    ) {
        return "No additional metadata.";
    }

    try {
        return JSON.stringify(
            metadata,
            null,
            2
        );
    } catch {
        return String(metadata);
    }
}

function getActionBadgeClass(action) {
    if (
        action?.includes(
            "PAYMENT"
        )
    ) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (
        action?.includes(
            "FINE"
        )
    ) {
        return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (
        action?.includes(
            "ANNOUNCEMENT"
        )
    ) {
        return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (
        action?.includes(
            "ITEM"
        )
    ) {
        return "bg-purple-50 text-purple-700 border-purple-200";
    }

    return "bg-gray-50 text-gray-700 border-gray-200";
}

/* =========================================================
   PAGE
========================================================= */

export default function ActivityPage() {
    const [
        activities,
        setActivities
    ] = useState([]);

    const [
        pagination,
        setPagination
    ] = useState({
        page: 1,
        pageSize: PAGE_SIZE,
        total: 0,
        totalPages: 0
    });

    const [
        search,
        setSearch
    ] = useState("");

    const [
        action,
        setAction
    ] = useState("");

    const [
        entityType,
        setEntityType
    ] = useState("");

    const [
        startDate,
        setStartDate
    ] = useState("");

    const [
        endDate,
        setEndDate
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        selectedActivity,
        setSelectedActivity
    ] = useState(null);

    const [
        detailsLoading,
        setDetailsLoading
    ] = useState(false);

    const [
        detailsError,
        setDetailsError
    ] = useState("");

    /* =====================================================
       LOAD ACTIVITY
    ===================================================== */

    const loadActivities =
        useCallback(
            async (
                requestedPage = 1
            ) => {
                setLoading(true);
                setError("");

                try {
                    const result =
                        await getActivityLogs({
                            search,
                            action,
                            entityType,
                            startDate,
                            endDate,
                            page:
                                requestedPage,
                            pageSize:
                                PAGE_SIZE
                        });

                    setActivities(
                        result?.data || []
                    );

                    setPagination(
                        result?.pagination ||
                            {
                                page:
                                    requestedPage,
                                pageSize:
                                    PAGE_SIZE,
                                total: 0,
                                totalPages: 0
                            }
                    );
                } catch (
                    requestError
                ) {
                    setActivities([]);

                    setError(
                        requestError?.message ||
                            "Unable to load activity logs."
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                search,
                action,
                entityType,
                startDate,
                endDate
            ]
        );

    /* =====================================================
       INITIAL / FILTER LOAD
    ===================================================== */

    useEffect(() => {
        let active = true;

        async function run() {
            await Promise.resolve();

            if (!active) {
                return;
            }

            await loadActivities(1);
        }

        run();

        return () => {
            active = false;
        };
    }, [loadActivities]);

    /* =====================================================
       OPEN DETAILS
    ===================================================== */

    const openDetails =
        useCallback(
            async (activity) => {
                setDetailsLoading(true);
                setDetailsError("");
                setSelectedActivity(null);

                try {
                    const result =
                        await getActivityLog(
                            activity.id
                        );

                    setSelectedActivity(
                        result?.data ||
                            null
                    );
                } catch (
                    requestError
                ) {
                    setDetailsError(
                        requestError?.message ||
                            "Unable to load activity details."
                    );
                } finally {
                    setDetailsLoading(false);
                }
            },
            []
        );

    /* =====================================================
       CLOSE DETAILS
    ===================================================== */

    const closeDetails =
        useCallback(() => {
            if (detailsLoading) {
                return;
            }

            setSelectedActivity(null);
            setDetailsError("");
        }, [detailsLoading]);

    /* =====================================================
       PAGINATION
    ===================================================== */

    const paginationPages =
        useMemo(() => {
            const totalPages =
                pagination.totalPages ||
                0;

            if (totalPages <= 0) {
                return [];
            }

            const current =
                pagination.page || 1;

            const pages = [];

            const start =
                Math.max(
                    1,
                    current - 2
                );

            const end =
                Math.min(
                    totalPages,
                    current + 2
                );

            for (
                let page = start;
                page <= end;
                page += 1
            ) {
                pages.push(page);
            }

            return pages;
        }, [pagination]);

    /* =====================================================
       FILTER RESET
    ===================================================== */

    function clearFilters() {
        setSearch("");
        setAction("");
        setEntityType("");
        setStartDate("");
        setEndDate("");
    }

    const hasFilters =
        Boolean(
            search ||
                action ||
                entityType ||
                startDate ||
                endDate
        );

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f7f3] text-gray-900">
            <AdminSidebar />

            <AdminMobileNav />

            <main className="min-w-0 lg:pl-64">
                <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

                    {/* =================================================
                       HEADER
                    ================================================= */}

                    <div className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-[#6f7f5f]">
                                    Administration
                                </p>

                                <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight text-[#263329] sm:text-3xl">
                                    Activity Log
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                    Review administrative actions
                                    performed across the BAJIM system.
                                </p>
                            </div>

                            <div className="w-full shrink-0 rounded-xl border border-[#dedbd1] bg-white px-4 py-3 shadow-sm sm:w-auto sm:min-w-40">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Total activities
                                </p>

                                <p className="mt-1 text-xl font-semibold text-[#263329]">
                                    {pagination.total || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                       FILTERS
                    ================================================= */}

                    <section className="mb-6 rounded-2xl border border-[#dedbd1] bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-[#263329]">
                                Filters
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                Search and narrow down administrative
                                activity.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                            {/* Search */}

                            <div className="min-w-0 sm:col-span-2 lg:col-span-3">
                                <label
                                    htmlFor="activity-search"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Search
                                </label>

                                <input
                                    id="activity-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search description, actor, member ID, phone or email..."
                                    className="min-h-11 w-full rounded-xl border border-[#d9d6cc] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#879a70] focus:ring-2 focus:ring-[#879a70]/20"
                                />
                            </div>

                            {/* Action */}

                            <div className="min-w-0">
                                <label
                                    htmlFor="activity-action"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Action
                                </label>

                                <select
                                    id="activity-action"
                                    value={action}
                                    onChange={(event) =>
                                        setAction(
                                            event.target.value
                                        )
                                    }
                                    className="min-h-11 w-full rounded-xl border border-[#d9d6cc] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#879a70] focus:ring-2 focus:ring-[#879a70]/20"
                                >
                                    {ACTION_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Entity */}

                            <div className="min-w-0">
                                <label
                                    htmlFor="activity-entity"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Entity
                                </label>

                                <select
                                    id="activity-entity"
                                    value={entityType}
                                    onChange={(event) =>
                                        setEntityType(
                                            event.target.value
                                        )
                                    }
                                    className="min-h-11 w-full rounded-xl border border-[#d9d6cc] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#879a70] focus:ring-2 focus:ring-[#879a70]/20"
                                >
                                    {ENTITY_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* From */}

                            <div className="min-w-0">
                                <label
                                    htmlFor="activity-start-date"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    From
                                </label>

                                <input
                                    id="activity-start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(event) =>
                                        setStartDate(
                                            event.target.value
                                        )
                                    }
                                    className="min-h-11 w-full rounded-xl border border-[#d9d6cc] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#879a70] focus:ring-2 focus:ring-[#879a70]/20"
                                />
                            </div>

                            {/* To */}

                            <div className="min-w-0">
                                <label
                                    htmlFor="activity-end-date"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    To
                                </label>

                                <input
                                    id="activity-end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(event) =>
                                        setEndDate(
                                            event.target.value
                                        )
                                    }
                                    className="min-h-11 w-full rounded-xl border border-[#d9d6cc] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#879a70] focus:ring-2 focus:ring-[#879a70]/20"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <button
                                type="button"
                                onClick={() =>
                                    loadActivities(1)
                                }
                                className="min-h-11 w-full rounded-xl bg-[#526442] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#455637] focus:outline-none focus:ring-2 focus:ring-[#526442]/30 sm:w-auto"
                            >
                                Apply filters
                            </button>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                    className="min-h-11 w-full rounded-xl border border-[#d9d6cc] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </section>

                    {/* =================================================
                       ERROR
                    ================================================= */}

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">
                                Unable to load activity logs
                            </p>

                            <p className="mt-1 break-words text-sm leading-6 text-red-700">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    loadActivities(
                                        pagination.page ||
                                            1
                                    )
                                }
                                className="mt-3 min-h-10 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* =================================================
                       ACTIVITY LIST
                    ================================================= */}

                    <section className="overflow-hidden rounded-2xl border border-[#dedbd1] bg-white shadow-sm">
                        <div className="border-b border-[#e7e4db] px-4 py-4 sm:px-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-[#263329]">
                                        Administrative Activity
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Most recent actions appear first.
                                    </p>
                                </div>

                                {!loading &&
                                    pagination.total >
                                        0 && (
                                        <span className="shrink-0 text-sm text-gray-500">
                                            {
                                                pagination.total
                                            }{" "}
                                            record
                                            {pagination.total ===
                                            1
                                                ? ""
                                                : "s"}
                                        </span>
                                    )}
                            </div>
                        </div>

                        {/* Loading */}

                        {loading ? (
                            <div className="space-y-4 p-4 sm:p-5">
                                {[
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map(
                                    (item) => (
                                        <div
                                            key={
                                                item
                                            }
                                            className="animate-pulse rounded-xl border border-gray-100 p-4"
                                        >
                                            <div className="h-4 w-40 max-w-full rounded bg-gray-200" />

                                            <div className="mt-3 h-3 w-3/4 max-w-full rounded bg-gray-100" />

                                            <div className="mt-2 h-3 w-1/2 max-w-full rounded bg-gray-100" />
                                        </div>
                                    )
                                )}
                            </div>
                        ) : activities.length ===
                          0 ? (
                            <div className="px-5 py-14 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1e9] text-[#526442]">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-6 w-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 8v4l2.5 1.5M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[#263329]">
                                    No activity found
                                </h3>

                                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
                                    There are no activity
                                    records matching
                                    the current filters.
                                </p>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="mt-4 min-h-11 rounded-xl border border-[#d9d6cc] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* =================================================
                                   DESKTOP TABLE
                                ================================================= */}

                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="min-w-full divide-y divide-[#e7e4db]">
                                        <thead className="bg-[#faf9f6]">
                                            <tr>
                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Date
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Actor
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Action
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Entity
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Description
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[#eeeae1]">
                                            {activities.map(
                                                (
                                                    activity
                                                ) => (
                                                    <tr
                                                        key={
                                                            activity.id
                                                        }
                                                        className="transition hover:bg-[#fcfbf8]"
                                                    >
                                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                                            {formatDateTime(
                                                                activity.created_at
                                                            )}
                                                        </td>

                                                        <td className="max-w-48 px-5 py-4">
                                                            <p className="break-words text-sm font-medium text-gray-800">
                                                                {activity.actor_name ||
                                                                    "Unknown actor"}
                                                            </p>

                                                            <p className="mt-0.5 break-words text-xs text-gray-500">
                                                                {activity.actor_role ||
                                                                    "—"}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex max-w-52 rounded-full border px-2.5 py-1 text-xs font-medium ${getActionBadgeClass(
                                                                    activity.action
                                                                )}`}
                                                            >
                                                                {formatAction(
                                                                    activity.action
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                                            {formatEntityType(
                                                                activity.entity_type
                                                            )}
                                                        </td>

                                                        <td className="max-w-md px-5 py-4 text-sm text-gray-700">
                                                            <p className="line-clamp-2 break-words">
                                                                {
                                                                    activity.description
                                                                }
                                                            </p>
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDetails(
                                                                        activity
                                                                    )
                                                                }
                                                                className="min-h-10 rounded-lg border border-[#d9d6cc] bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
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

                                {/* =================================================
                                   MOBILE / TABLET CARDS
                                ================================================= */}

                                <div className="divide-y divide-[#eeeae1] lg:hidden">
                                    {activities.map(
                                        (
                                            activity
                                        ) => (
                                            <article
                                                key={
                                                    activity.id
                                                }
                                                className="min-w-0 p-4 sm:p-5"
                                            >
                                                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="break-words text-sm font-semibold text-gray-800">
                                                            {activity.actor_name ||
                                                                "Unknown actor"}
                                                        </p>

                                                        <p className="mt-0.5 break-words text-xs text-gray-500">
                                                            {formatDateTime(
                                                                activity.created_at
                                                            )}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit max-w-full break-words rounded-full border px-2.5 py-1 text-xs font-medium ${getActionBadgeClass(
                                                            activity.action
                                                        )}`}
                                                    >
                                                        {formatAction(
                                                            activity.action
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-3 break-words text-sm leading-6 text-gray-700">
                                                    {
                                                        activity.description
                                                    }
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="max-w-full break-words rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600">
                                                        {formatEntityType(
                                                            activity.entity_type
                                                        )}
                                                    </span>

                                                    {activity.actor_role && (
                                                        <span className="max-w-full break-words rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600">
                                                            {
                                                                activity.actor_role
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDetails(
                                                            activity
                                                        )
                                                    }
                                                    className="mt-4 min-h-11 w-full rounded-xl border border-[#d9d6cc] bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                                                >
                                                    View details
                                                </button>
                                            </article>
                                        )
                                    )}
                                </div>
                            </>
                        )}

                        {/* =================================================
                           PAGINATION
                        ================================================= */}

                        {!loading &&
                            activities.length >
                                0 &&
                            pagination.totalPages >
                                1 && (
                                <div className="border-t border-[#e7e4db] px-4 py-4 sm:px-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-gray-500">
                                            Page{" "}
                                            {
                                                pagination.page
                                            }{" "}
                                            of{" "}
                                            {
                                                pagination.totalPages
                                            }
                                        </p>

                                        <div className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
                                            <button
                                                type="button"
                                                disabled={
                                                    pagination.page <=
                                                        1 ||
                                                    loading
                                                }
                                                onClick={() =>
                                                    loadActivities(
                                                        pagination.page -
                                                            1
                                                    )
                                                }
                                                className="min-h-11 shrink-0 rounded-lg border border-[#d9d6cc] bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Previous
                                            </button>

                                            {paginationPages.map(
                                                (
                                                    page
                                                ) => (
                                                    <button
                                                        key={
                                                            page
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            loadActivities(
                                                                page
                                                            )
                                                        }
                                                        className={`min-h-11 min-w-11 shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                                                            page ===
                                                            pagination.page
                                                                ? "bg-[#526442] text-white"
                                                                : "border border-[#d9d6cc] bg-white text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {
                                                            page
                                                        }
                                                    </button>
                                                )
                                            )}

                                            <button
                                                type="button"
                                                disabled={
                                                    pagination.page >=
                                                        pagination.totalPages ||
                                                    loading
                                                }
                                                onClick={() =>
                                                    loadActivities(
                                                        pagination.page +
                                                            1
                                                    )
                                                }
                                                className="min-h-11 shrink-0 rounded-lg border border-[#d9d6cc] bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
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

            {/* =========================================================
               DETAILS MODAL
            ========================================================= */}

            {(detailsLoading ||
                selectedActivity ||
                detailsError) && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDetails();
                        }
                    }}
                >
                    <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">

                        {/* Modal header */}

                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e7e4db] px-4 py-4 sm:px-5">
                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-[#6f7f5f]">
                                    Activity details
                                </p>

                                <h2 className="mt-1 break-words text-lg font-semibold text-[#263329]">
                                    Administrative action
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeDetails
                                }
                                disabled={
                                    detailsLoading
                                }
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Close activity details"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        d="M6 6l12 12M18 6L6 18"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Modal body */}

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

                            {detailsLoading ? (
                                <div className="space-y-4 p-4 sm:p-5">
                                    <div className="h-5 w-40 max-w-full animate-pulse rounded bg-gray-200" />

                                    <div className="h-20 animate-pulse rounded-xl bg-gray-100" />

                                    <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
                                </div>
                            ) : detailsError ? (
                                <div className="p-4 sm:p-5">
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        <p className="text-sm font-medium text-red-800">
                                            Unable to load details
                                        </p>

                                        <p className="mt-1 break-words text-sm leading-6 text-red-700">
                                            {
                                                detailsError
                                            }
                                        </p>
                                    </div>
                                </div>
                            ) : selectedActivity ? (
                                <div className="space-y-5 p-4 sm:p-5">

                                    {/* Action */}

                                    <div className="min-w-0">
                                        <span
                                            className={`inline-flex max-w-full break-words rounded-full border px-3 py-1.5 text-xs font-medium ${getActionBadgeClass(
                                                selectedActivity.action
                                            )}`}
                                        >
                                            {formatAction(
                                                selectedActivity.action
                                            )}
                                        </span>

                                        <p className="mt-3 break-words text-base leading-7 text-gray-800">
                                            {
                                                selectedActivity.description
                                            }
                                        </p>
                                    </div>

                                    {/* Actor */}

                                    <div className="rounded-xl border border-[#e7e4db] bg-[#faf9f6] p-4">
                                        <h3 className="text-sm font-semibold text-[#263329]">
                                            Actor
                                        </h3>

                                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Name"
                                                value={
                                                    selectedActivity.actor_name
                                                }
                                            />

                                            <DetailField
                                                label="Role"
                                                value={
                                                    selectedActivity.actor_role
                                                }
                                            />

                                            <DetailField
                                                label="Member ID"
                                                value={
                                                    selectedActivity.actor_member_id
                                                }
                                            />

                                            <DetailField
                                                label="Phone"
                                                value={
                                                    selectedActivity.actor_phone
                                                }
                                            />

                                            <DetailField
                                                label="Email"
                                                value={
                                                    selectedActivity.actor_email
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Activity */}

                                    <div className="rounded-xl border border-[#e7e4db] bg-[#faf9f6] p-4">
                                        <h3 className="text-sm font-semibold text-[#263329]">
                                            Activity
                                        </h3>

                                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Entity"
                                                value={formatEntityType(
                                                    selectedActivity.entity_type
                                                )}
                                            />

                                            <DetailField
                                                label="Entity ID"
                                                value={
                                                    selectedActivity.entity_id
                                                }
                                            />

                                            <DetailField
                                                label="Date and time"
                                                value={formatDateTime(
                                                    selectedActivity.created_at
                                                )}
                                            />

                                            <DetailField
                                                label="IP address"
                                                value={
                                                    selectedActivity.ip_address
                                                }
                                            />

                                            <DetailField
                                                label="Activity ID"
                                                value={
                                                    selectedActivity.id
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Metadata */}

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-[#263329]">
                                            Metadata
                                        </h3>

                                        <pre className="mt-2 max-h-64 overflow-auto overscroll-contain whitespace-pre-wrap break-words rounded-xl bg-[#202820] p-4 text-xs leading-6 text-gray-100">
                                            {formatMetadata(
                                                selectedActivity.metadata
                                            )}
                                        </pre>
                                    </div>

                                    {/* User agent */}

                                    {selectedActivity.user_agent && (
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-[#263329]">
                                                User agent
                                            </h3>

                                            <p className="mt-2 break-all rounded-xl border border-[#e7e4db] bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                                                {
                                                    selectedActivity.user_agent
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================================================
   DETAIL FIELD
========================================================= */

function DetailField({
    label,
    value
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="mt-1 break-words text-sm leading-5 text-gray-800">
                {value || "—"}
            </p>
        </div>
    );
}
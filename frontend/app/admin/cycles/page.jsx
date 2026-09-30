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
    getAdminCycles,
    createAdminCycle,
    updateAdminCycle,
    updateAdminCycleStatus
} from "../../../services/adminApi";

const ALLOWED_STATUSES = [
    "DRAFT",
    "OPEN",
    "CLOSED"
];

const STATUS_OPTIONS = [
    {
        value: "DRAFT",
        label: "Draft"
    },
    {
        value: "OPEN",
        label: "Open"
    },
    {
        value: "CLOSED",
        label: "Closed"
    }
];

const EMPTY_FORM = {
    cycle_name: "",
    starts_at: "",
    due_at: "",
    grace_until: "",
    contribution_amount: "3000",
    fine_amount: "500",
    status: "DRAFT",
    notes: ""
};

function formatCurrency(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
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
        minute: "2-digit",
        hour12: true
    });
}

function toDateTimeLocal(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (number) =>
        String(number).padStart(2, "0");

    return (
        [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join("-") +
        "T" +
        [
            pad(date.getHours()),
            pad(date.getMinutes())
        ].join(":")
    );
}

function getStatusClasses(status) {
    switch (status) {
        case "OPEN":
            return "border-green-200 bg-green-50 text-green-700";

        case "CLOSED":
            return "border-gray-200 bg-gray-100 text-gray-700";

        case "DRAFT":
        default:
            return "border-amber-200 bg-amber-50 text-amber-700";
    }
}

function getStatusLabel(status) {
    switch (status) {
        case "OPEN":
            return "Open";

        case "CLOSED":
            return "Closed";

        case "DRAFT":
        default:
            return "Draft";
    }
}

function emptyForm() {
    return {
        ...EMPTY_FORM
    };
}

export default function ContributionCyclesPage() {
    const [cycles, setCycles] = useState([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingStatus, setChangingStatus] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingCycle, setEditingCycle] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm());

    const [viewCycle, setViewCycle] =
        useState(null);

    const loadCycles = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getAdminCycles({
                        search: search.trim(),
                        status: statusFilter,
                        page,
                        limit: 20
                    });

                const cycleData = Array.isArray(
                    response?.data
                )
                    ? response.data
                    : [];

                const responsePagination =
                    response?.pagination || {};

                const currentPage = Number(
                    responsePagination.page || page
                );

                const limit = Number(
                    responsePagination.limit || 20
                );

                const total = Number(
                    responsePagination.total || 0
                );

                const totalPages = Number(
                    responsePagination.totalPages || 0
                );

                setCycles(cycleData);

                setPagination({
                    page: currentPage,
                    limit,
                    total,
                    totalPages,
                    hasNextPage:
                        currentPage < totalPages,
                    hasPreviousPage:
                        currentPage > 1
                });
            } catch (requestError) {
                console.error(
                    "Load contribution cycles error:",
                    requestError
                );

                setError(
                    requestError?.message ||
                        "Unable to load contribution cycles."
                );

                setCycles([]);

                setPagination({
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                });
            } finally {
                setLoading(false);
            }
        },
        [search, statusFilter]
    );

    useEffect(() => {
        let active = true;

        async function run() {
            await Promise.resolve();

            if (!active) {
                return;
            }

            await loadCycles(1);
        }

        run();

        return () => {
            active = false;
        };
    }, [loadCycles]);

    const openCreateModal = () => {
        setEditingCycle(null);
        setForm(emptyForm());
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const openEditModal = (cycle) => {
        setEditingCycle(cycle);

        const normalizedStatus =
            ALLOWED_STATUSES.includes(
                String(
                    cycle?.status || ""
                ).toUpperCase()
            )
                ? String(
                      cycle.status
                  ).toUpperCase()
                : "DRAFT";

        setForm({
            cycle_name:
                cycle?.cycle_name || "",

            starts_at: toDateTimeLocal(
                cycle?.starts_at
            ),

            due_at: toDateTimeLocal(
                cycle?.due_at
            ),

            grace_until: toDateTimeLocal(
                cycle?.grace_until
            ),

            contribution_amount:
                cycle?.contribution_amount !==
                    null &&
                cycle?.contribution_amount !==
                    undefined
                    ? String(
                          cycle.contribution_amount
                      )
                    : "3000",

            fine_amount:
                cycle?.fine_amount !== null &&
                cycle?.fine_amount !== undefined
                    ? String(
                          cycle.fine_amount
                      )
                    : "500",

            status: normalizedStatus,

            notes: cycle?.notes || ""
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingCycle(null);
        setForm(emptyForm());
        setError("");
    };

    const handleInputChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const cycleName =
                form.cycle_name.trim();

            const status = String(
                form.status || "DRAFT"
            )
                .trim()
                .toUpperCase();

            const contributionAmount =
                Number(
                    form.contribution_amount
                );

            const fineAmount = Number(
                form.fine_amount
            );

            if (!cycleName) {
                throw new Error(
                    "Cycle name is required."
                );
            }

            if (
                !ALLOWED_STATUSES.includes(
                    status
                )
            ) {
                throw new Error(
                    "Invalid contribution cycle status."
                );
            }

            if (
                !Number.isFinite(
                    contributionAmount
                ) ||
                contributionAmount < 0
            ) {
                throw new Error(
                    "Contribution amount must be a valid non-negative number."
                );
            }

            if (
                !Number.isFinite(fineAmount) ||
                fineAmount < 0
            ) {
                throw new Error(
                    "Fine amount must be a valid non-negative number."
                );
            }

            if (!form.starts_at) {
                throw new Error(
                    "Start date and time are required."
                );
            }

            if (!form.due_at) {
                throw new Error(
                    "Due date and time are required."
                );
            }

            if (!form.grace_until) {
                throw new Error(
                    "Grace period end date and time are required."
                );
            }

            const startsAt = new Date(
                form.starts_at
            );

            const dueAt = new Date(
                form.due_at
            );

            const graceUntil = new Date(
                form.grace_until
            );

            if (
                Number.isNaN(
                    startsAt.getTime()
                ) ||
                Number.isNaN(
                    dueAt.getTime()
                ) ||
                Number.isNaN(
                    graceUntil.getTime()
                )
            ) {
                throw new Error(
                    "One or more dates are invalid."
                );
            }

            if (dueAt < startsAt) {
                throw new Error(
                    "The due date cannot be earlier than the start date."
                );
            }

            if (graceUntil < dueAt) {
                throw new Error(
                    "The grace period cannot end before the due date."
                );
            }

            const payload = {
                cycle_name: cycleName,
                starts_at:
                    startsAt.toISOString(),
                due_at:
                    dueAt.toISOString(),
                grace_until:
                    graceUntil.toISOString(),
                contribution_amount:
                    contributionAmount,
                fine_amount: fineAmount,
                status,
                notes:
                    form.notes.trim() || null
            };

            if (editingCycle) {
                await updateAdminCycle(
                    editingCycle.id,
                    payload
                );

                setSuccess(
                    "Contribution cycle updated successfully."
                );
            } else {
                await createAdminCycle(
                    payload
                );

                setSuccess(
                    "Contribution cycle created successfully."
                );
            }

            setShowModal(false);
            setEditingCycle(null);
            setForm(emptyForm());

            await loadCycles(1);
        } catch (requestError) {
            console.error(
                "Save contribution cycle error:",
                requestError
            );

            setError(
                requestError?.message ||
                    "Unable to save contribution cycle."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (
        cycle,
        newStatus
    ) => {
        if (!cycle?.id) {
            return;
        }

        const normalizedStatus = String(
            newStatus || ""
        )
            .trim()
            .toUpperCase();

        if (
            !ALLOWED_STATUSES.includes(
                normalizedStatus
            )
        ) {
            setError(
                "Invalid contribution cycle status."
            );

            return;
        }

        if (
            normalizedStatus ===
            cycle.status
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Change "${cycle.cycle_name}" status from ${getStatusLabel(
                cycle.status
            )} to ${getStatusLabel(
                normalizedStatus
            )}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setChangingStatus(true);
            setError("");
            setSuccess("");

            await updateAdminCycleStatus(
                cycle.id,
                normalizedStatus
            );

            setSuccess(
                `Contribution cycle status changed to ${getStatusLabel(
                    normalizedStatus
                )}.`
            );

            await loadCycles(
                pagination.page
            );
        } catch (requestError) {
            console.error(
                "Change contribution cycle status error:",
                requestError
            );

            setError(
                requestError?.message ||
                    "Unable to change contribution cycle status."
            );
        } finally {
            setChangingStatus(false);
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        loadCycles(1);
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("");
    };

    const handlePreviousPage = () => {
        if (
            pagination.hasPreviousPage &&
            !loading
        ) {
            loadCycles(
                pagination.page - 1
            );
        }
    };

    const handleNextPage = () => {
        if (
            pagination.hasNextPage &&
            !loading
        ) {
            loadCycles(
                pagination.page + 1
            );
        }
    };

    const totalCycles =
        pagination.total || 0;

    const openCycles = useMemo(
        () =>
            cycles.filter(
                (cycle) =>
                    cycle.status === "OPEN"
            ).length,
        [cycles]
    );

    const draftCycles = useMemo(
        () =>
            cycles.filter(
                (cycle) =>
                    cycle.status === "DRAFT"
            ).length,
        [cycles]
    );

    const closedCycles = useMemo(
        () =>
            cycles.filter(
                (cycle) =>
                    cycle.status === "CLOSED"
            ).length,
        [cycles]
    );

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f6f1] text-gray-900">
            <AdminSidebar />

            <div className="lg:ml-64">
                <AdminMobileNav />

                <main className="px-3 pb-8 pt-5 sm:px-5 sm:pb-10 sm:pt-6 md:px-6 lg:px-8 lg:pt-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-6 flex flex-col gap-4 sm:mb-7 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-green-700">
                                    Administration
                                </p>

                                <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                    Contribution Cycles
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                    Create and manage contribution
                                    periods, due dates, grace
                                    periods and applicable fines.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    openCreateModal
                                }
                                className="flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 sm:w-auto"
                            >
                                + Create Contribution Cycle
                            </button>
                        </div>

                        {/* Alerts */}
                        {(error || success) && (
                            <div className="mb-6 space-y-3">
                                {error && (
                                    <div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="break-words rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                                        {success}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Statistics */}
                        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-4">
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Cycles
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {totalCycles}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Contribution cycles in the
                                    system
                                </p>
                            </div>

                            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm sm:p-5">
                                <p className="text-sm font-medium text-green-700">
                                    Open Cycles
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-800">
                                    {openCycles}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-green-700">
                                    Open cycles on this page
                                </p>
                            </div>

                            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm sm:p-5">
                                <p className="text-sm font-medium text-amber-700">
                                    Draft Cycles
                                </p>

                                <p className="mt-2 text-3xl font-bold text-amber-800">
                                    {draftCycles}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                    Draft cycles on this page
                                </p>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                                <p className="text-sm font-medium text-gray-500">
                                    Closed Cycles
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {closedCycles}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Closed cycles on this page
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                            <form
                                onSubmit={
                                    handleSearchSubmit
                                }
                                className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]"
                            >
                                <div className="min-w-0">
                                    <label
                                        htmlFor="cycle-search"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Search cycles
                                    </label>

                                    <input
                                        id="cycle-search"
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
                                        placeholder="Search by cycle name or notes..."
                                        className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label
                                        htmlFor="cycle-status"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="cycle-status"
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
                                        className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    >
                                        <option value="">
                                            All statuses
                                        </option>

                                        {STATUS_OPTIONS.map(
                                            (
                                                option
                                            ) => (
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

                                <div className="grid grid-cols-2 gap-2 lg:flex">
                                    <button
                                        type="submit"
                                        disabled={
                                            loading
                                        }
                                        className="min-h-11 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                                    >
                                        Search
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleClearFilters
                                        }
                                        className="min-h-11 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:px-5"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Directory */}
                        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Cycle Directory
                                        </h2>

                                        <p className="mt-1 text-sm leading-5 text-gray-500">
                                            Showing{" "}
                                            {
                                                cycles.length
                                            }{" "}
                                            of{" "}
                                            {
                                                pagination.total
                                            }{" "}
                                            contribution
                                            cycles
                                        </p>
                                    </div>

                                    {pagination.totalPages >
                                        0 && (
                                        <p className="shrink-0 text-sm text-gray-500">
                                            Page{" "}
                                            {
                                                pagination.page
                                            }{" "}
                                            of{" "}
                                            {
                                                pagination.totalPages
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="px-5 py-16 text-center sm:px-6">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />

                                    <p className="mt-4 text-sm text-gray-500">
                                        Loading contribution
                                        cycles...
                                    </p>
                                </div>
                            ) : cycles.length ===
                              0 ? (
                                <div className="px-5 py-16 text-center sm:px-6">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                                        📋
                                    </div>

                                    <h3 className="mt-4 text-base font-semibold text-gray-900">
                                        No contribution cycles
                                        found
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                        There are no contribution
                                        cycles matching the current
                                        search and status filters.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            openCreateModal
                                        }
                                        className="mt-5 min-h-11 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
                                    >
                                        Create First Cycle
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Cycle
                                                    </th>

                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Start
                                                    </th>

                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Due
                                                    </th>

                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Grace Until
                                                    </th>

                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Contribution
                                                    </th>

                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Fine
                                                    </th>

                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Status
                                                    </th>

                                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100">
                                                {cycles.map(
                                                    (
                                                        cycle
                                                    ) => (
                                                        <tr
                                                            key={
                                                                cycle.id
                                                            }
                                                            className="transition hover:bg-gray-50"
                                                        >
                                                            <td className="max-w-xs px-6 py-4">
                                                                <div className="min-w-0">
                                                                    <p className="break-words font-semibold text-gray-900">
                                                                        {
                                                                            cycle.cycle_name
                                                                        }
                                                                    </p>

                                                                    {cycle.notes && (
                                                                        <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                                                            {
                                                                                cycle.notes
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                                {formatDateTime(
                                                                    cycle.starts_at
                                                                )}
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                                {formatDateTime(
                                                                    cycle.due_at
                                                                )}
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                                {formatDateTime(
                                                                    cycle.grace_until
                                                                )}
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                                {formatCurrency(
                                                                    cycle.contribution_amount
                                                                )}
                                                            </td>

                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                                {formatCurrency(
                                                                    cycle.fine_amount
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                                        cycle.status
                                                                    )}`}
                                                                >
                                                                    {getStatusLabel(
                                                                        cycle.status
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setViewCycle(
                                                                                cycle
                                                                            )
                                                                        }
                                                                        className="min-h-10 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        View
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                cycle
                                                                            )
                                                                        }
                                                                        className="min-h-10 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile and tablet cards */}
                                    <div className="divide-y divide-gray-100 lg:hidden">
                                        {cycles.map(
                                            (
                                                cycle
                                            ) => (
                                                <div
                                                    key={
                                                        cycle.id
                                                    }
                                                    className="p-4 sm:p-5"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="break-words font-semibold text-gray-900">
                                                                {
                                                                    cycle.cycle_name
                                                                }
                                                            </h3>

                                                            {cycle.notes && (
                                                                <p className="mt-1 break-words text-sm leading-5 text-gray-500">
                                                                    {
                                                                        cycle.notes
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <span
                                                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${getStatusClasses(
                                                                cycle.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                cycle.status
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                                                Starts
                                                            </p>

                                                            <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                                                {formatDateTime(
                                                                    cycle.starts_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                                                Due
                                                            </p>

                                                            <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                                                {formatDateTime(
                                                                    cycle.due_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                                                Grace Until
                                                            </p>

                                                            <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                                                {formatDateTime(
                                                                    cycle.grace_until
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                                                Contribution
                                                            </p>

                                                            <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    cycle.contribution_amount
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                                                Fine
                                                            </p>

                                                            <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    cycle.fine_amount
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setViewCycle(
                                                                    cycle
                                                                )
                                                            }
                                                            className="min-h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    cycle
                                                                )
                                                            }
                                                            className="min-h-11 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Pagination */}
                            {!loading &&
                                pagination.totalPages >
                                    1 && (
                                    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                        <p className="text-sm text-gray-500">
                                            Page{" "}
                                            <span className="font-medium text-gray-700">
                                                {
                                                    pagination.page
                                                }
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium text-gray-700">
                                                {
                                                    pagination.totalPages
                                                }
                                            </span>
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 sm:flex">
                                            <button
                                                type="button"
                                                onClick={
                                                    handlePreviousPage
                                                }
                                                disabled={
                                                    !pagination.hasPreviousPage ||
                                                    loading
                                                }
                                                className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Previous
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    handleNextPage
                                                }
                                                disabled={
                                                    !pagination.hasNextPage ||
                                                    loading
                                                }
                                                className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
                    <div className="flex max-h-[96vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl">
                        <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="break-words text-lg font-bold text-gray-900 sm:text-xl">
                                        {editingCycle
                                            ? "Edit Contribution Cycle"
                                            : "Create Contribution Cycle"}
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Configure the contribution
                                        period, payment deadline and
                                        grace period.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="space-y-5 p-4 sm:p-6"
                            >
                                {error && (
                                    <div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="cycle_name"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Cycle Name
                                    </label>

                                    <input
                                        id="cycle_name"
                                        name="cycle_name"
                                        type="text"
                                        value={
                                            form.cycle_name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. October 2026 Contribution"
                                        required
                                        className="min-h-11 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="starts_at"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            Starts At
                                        </label>

                                        <input
                                            id="starts_at"
                                            name="starts_at"
                                            type="datetime-local"
                                            value={
                                                form.starts_at
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className="min-h-11 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:px-4"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="due_at"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            Due At
                                        </label>

                                        <input
                                            id="due_at"
                                            name="due_at"
                                            type="datetime-local"
                                            value={
                                                form.due_at
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className="min-h-11 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:px-4"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="grace_until"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Grace Period Until
                                    </label>

                                    <input
                                        id="grace_until"
                                        name="grace_until"
                                        type="datetime-local"
                                        value={
                                            form.grace_until
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className="min-h-11 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:px-4"
                                    />

                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        The fine becomes applicable
                                        after this time according to
                                        the configured cycle rules.
                                    </p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="contribution_amount"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            Contribution Amount (₦)
                                        </label>

                                        <input
                                            id="contribution_amount"
                                            name="contribution_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.contribution_amount
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className="min-h-11 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="fine_amount"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            Fine Amount (₦)
                                        </label>

                                        <input
                                            id="fine_amount"
                                            name="fine_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                form.fine_amount
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className="min-h-11 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="status"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            Status
                                        </label>

                                        <select
                                            id="status"
                                            name="status"
                                            value={
                                                form.status
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        >
                                            {STATUS_OPTIONS.map(
                                                (
                                                    option
                                                ) => (
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

                                    <div>
                                        <label
                                            htmlFor="notes"
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            Notes
                                        </label>

                                        <input
                                            id="notes"
                                            name="notes"
                                            type="text"
                                            value={
                                                form.notes
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Optional notes"
                                            className="min-h-11 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="min-h-11 w-full rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            saving
                                        }
                                        className="min-h-11 w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingCycle
                                              ? "Update Cycle"
                                              : "Create Cycle"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewCycle && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
                    <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl">
                        <div className="shrink-0 border-b border-gray-200 px-4 py-4 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                        Cycle Details
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Contribution cycle
                                        information.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewCycle(
                                            null
                                        )
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <div className="space-y-5 p-4 sm:p-6">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Cycle Name
                                    </p>

                                    <p className="mt-1 break-words text-lg font-semibold text-gray-900">
                                        {
                                            viewCycle.cycle_name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Status
                                    </p>

                                    <span
                                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                            viewCycle.status
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            viewCycle.status
                                        )}
                                    </span>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Starts At
                                        </p>

                                        <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                            {formatDateTime(
                                                viewCycle.starts_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Due At
                                        </p>

                                        <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                            {formatDateTime(
                                                viewCycle.due_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Grace Until
                                        </p>

                                        <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                            {formatDateTime(
                                                viewCycle.grace_until
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Contribution Amount
                                        </p>

                                        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                            {formatCurrency(
                                                viewCycle.contribution_amount
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Fine Amount
                                        </p>

                                        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                            {formatCurrency(
                                                viewCycle.fine_amount
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Created
                                        </p>

                                        <p className="mt-1 break-words text-sm leading-5 text-gray-700">
                                            {formatDateTime(
                                                viewCycle.created_at
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {viewCycle.notes && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Notes
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                                            {
                                                viewCycle.notes
                                            }
                                        </p>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-5">
                                    <label
                                        htmlFor="view-status-change"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Change Status
                                    </label>

                                    <select
                                        id="view-status-change"
                                        value={
                                            viewCycle.status ||
                                            "DRAFT"
                                        }
                                        disabled={
                                            changingStatus
                                        }
                                        onChange={async (
                                            event
                                        ) => {
                                            const newStatus =
                                                event
                                                    .target
                                                    .value;

                                            await handleStatusChange(
                                                viewCycle,
                                                newStatus
                                            );

                                            setViewCycle(
                                                (
                                                    current
                                                ) =>
                                                    current
                                                        ? {
                                                              ...current,
                                                              status: newStatus
                                                          }
                                                        : current
                                            );
                                        }}
                                        className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    >
                                        {STATUS_OPTIONS.map(
                                            (
                                                option
                                            ) => (
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

                                    {changingStatus && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Updating status...
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setViewCycle(
                                                null
                                            )
                                        }
                                        className="min-h-11 w-full rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const cycle =
                                                viewCycle;

                                            setViewCycle(
                                                null
                                            );

                                            openEditModal(
                                                cycle
                                            );
                                        }}
                                        className="min-h-11 w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 sm:w-auto"
                                    >
                                        Edit Cycle
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
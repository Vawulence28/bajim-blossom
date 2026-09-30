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
    getContributionReport,
    getPaymentReport,
    getFineReport,
    getReportMembers,
    getMemberStatement
} from "../../../services/reportApi";

const REPORT_TYPES = {
    CONTRIBUTIONS: "contributions",
    PAYMENTS: "payments",
    FINES: "fines",
    MEMBER_STATEMENT: "member-statement"
};

const PAGE_SIZE = 10;

function formatCurrency(value) {
    const amount = Number(value) || 0;

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
        dateStyle: "medium"
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
        timeStyle: "short"
    }).format(date);
}

function getStatusClass(status) {
    switch (
        String(status || "").toUpperCase()
    ) {
        case "PAID":
        case "VERIFIED":
        case "PUBLISHED":
        case "ACTIVE":
        case "COLLECTED":
            return "bg-green-50 text-green-700";

        case "OUTSTANDING":
        case "PENDING":
        case "DRAFT":
        case "ASSIGNED":
            return "bg-amber-50 text-amber-700";

        case "REJECTED":
        case "WAIVED":
        case "CANCELLED":
        case "INACTIVE":
        case "ARCHIVED":
            return "bg-red-50 text-red-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                status
            )}`}
        >
            <span className="break-words">
                {String(status || "—").replaceAll(
                    "_",
                    " "
                )}
            </span>
        </span>
    );
}

function SummaryCard({
    label,
    value,
    description
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-stone-500 sm:text-sm">
                {label}
            </p>

            <p className="mt-2 break-words text-xl font-semibold text-stone-900 sm:text-2xl">
                {value}
            </p>

            {description ? (
                <p className="mt-1 break-words text-xs leading-5 text-stone-500">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function EmptyState({
    message = "No records found."
}) {
    return (
        <div className="px-5 py-14 text-center sm:px-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 15H6L5 6" />
                </svg>
            </div>

            <p className="mt-4 text-sm font-medium text-stone-700">
                {message}
            </p>
        </div>
    );
}

function Pagination({
    page,
    totalPages,
    onChange
}) {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-stone-500">
                Page {page} of {totalPages}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                        onChange(page - 1)
                    }
                    className="min-h-11 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                        onChange(page + 1)
                    }
                    className="min-h-11 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function TableShell({
    children,
    empty,
    loading
}) {
    return (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {loading ? (
                <div className="px-5 py-14 text-center sm:px-6">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-green-700" />

                    <p className="mt-3 text-sm text-stone-500">
                        Loading report...
                    </p>
                </div>
            ) : empty ? (
                <EmptyState />
            ) : (
                <div className="min-w-0 overflow-x-auto">
                    {children}
                </div>
            )}
        </div>
    );
}

function MobileReportCard({
    children
}) {
    return (
        <div className="border-b border-stone-100 p-4 last:border-b-0 sm:p-5">
            {children}
        </div>
    );
}

function MobileField({
    label,
    children,
    emphasis = false
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                {label}
            </p>

            <div
                className={`mt-1 break-words text-sm leading-5 ${
                    emphasis
                        ? "font-medium text-stone-800"
                        : "text-stone-600"
                }`}
            >
                {children}
            </div>
        </div>
    );
}

export default function AdminReportsPage() {
    const [reportType, setReportType] =
        useState(REPORT_TYPES.CONTRIBUTIONS);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] =
        useState("");
    const [paymentMethod, setPaymentMethod] =
        useState("");
    const [startDate, setStartDate] =
        useState("");
    const [endDate, setEndDate] =
        useState("");

    const [memberSearch, setMemberSearch] =
        useState("");

    const [selectedMember, setSelectedMember] =
        useState("");

    const [members, setMembers] = useState([]);

    const [memberStatement, setMemberStatement] =
        useState(null);

    const [reportData, setReportData] =
        useState([]);

    const [summary, setSummary] =
        useState(null);

    const [pagination, setPagination] =
        useState({
            page: 1,
            pageSize: PAGE_SIZE,
            total: 0,
            totalPages: 0
        });

    const [loading, setLoading] =
        useState(false);

    const [memberLoading, setMemberLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [membersError, setMembersError] =
        useState("");

    const loadMembers = useCallback(
        async () => {
            if (
                reportType !==
                REPORT_TYPES.MEMBER_STATEMENT
            ) {
                return;
            }

            try {
                setMembersError("");
                setMemberLoading(true);

                const result =
                    await getReportMembers({
                        search: memberSearch,
                        status: "ACTIVE",
                        page: 1,
                        pageSize: 100
                    });

                setMembers(
                    result?.data ||
                        result?.members ||
                        []
                );
            } catch (requestError) {
                setMembersError(
                    requestError.message
                );
            } finally {
                setMemberLoading(false);
            }
        },
        [reportType, memberSearch]
    );

    const loadReport = useCallback(
        async (targetPage = 1) => {
            try {
                setError("");
                setLoading(true);

                if (
                    reportType ===
                    REPORT_TYPES.MEMBER_STATEMENT
                ) {
                    if (!selectedMember) {
                        setMemberStatement(null);
                        setReportData([]);
                        setSummary(null);

                        setPagination({
                            page: 1,
                            pageSize: PAGE_SIZE,
                            total: 0,
                            totalPages: 0
                        });

                        return;
                    }

                    const result =
                        await getMemberStatement(
                            selectedMember,
                            {
                                startDate,
                                endDate
                            }
                        );

                    setMemberStatement(
                        result?.data ||
                            result?.statement ||
                            null
                    );

                    setReportData([]);
                    setSummary(
                        result?.summary ||
                            result?.data?.summary ||
                            null
                    );

                    return;
                }

                const params = {
                    page: targetPage,
                    pageSize: PAGE_SIZE,
                    search,
                    startDate,
                    endDate
                };

                let result;

                if (
                    reportType ===
                    REPORT_TYPES.CONTRIBUTIONS
                ) {
                    result =
                        await getContributionReport({
                            ...params,
                            status
                        });
                }

                if (
                    reportType ===
                    REPORT_TYPES.PAYMENTS
                ) {
                    result =
                        await getPaymentReport({
                            ...params,
                            paymentStatus,
                            paymentMethod
                        });
                }

                if (
                    reportType ===
                    REPORT_TYPES.FINES
                ) {
                    result =
                        await getFineReport({
                            ...params,
                            status
                        });
                }

                const rows =
                    result?.data ||
                    result?.rows ||
                    result?.records ||
                    [];

                setReportData(
                    Array.isArray(rows)
                        ? rows
                        : []
                );

                setSummary(
                    result?.summary || null
                );

                setPagination(
                    result?.pagination || {
                        page: targetPage,
                        pageSize: PAGE_SIZE,
                        total: rows.length,
                        totalPages:
                            rows.length > 0
                                ? 1
                                : 0
                    }
                );
            } catch (requestError) {
                setError(
                    requestError.message
                );

                setReportData([]);
                setMemberStatement(null);
                setSummary(null);
            } finally {
                setLoading(false);
            }
        },
        [
            reportType,
            search,
            status,
            paymentStatus,
            paymentMethod,
            startDate,
            endDate,
            selectedMember
        ]
    );

    useEffect(() => {
        let active = true;

        async function run() {
            await Promise.resolve();

            if (!active) {
                return;
            }

            if (
                reportType ===
                REPORT_TYPES.MEMBER_STATEMENT
            ) {
                await loadMembers();
            }
        }

        run();

        return () => {
            active = false;
        };
    }, [loadMembers, reportType]);

    useEffect(() => {
        let active = true;

        async function run() {
            await Promise.resolve();

            if (!active) {
                return;
            }

            await loadReport(1);
        }

        run();

        return () => {
            active = false;
        };
    }, [loadReport]);

    function handleReportTypeChange(type) {
        setReportType(type);
        setSearch("");
        setStatus("");
        setPaymentStatus("");
        setPaymentMethod("");
        setStartDate("");
        setEndDate("");
        setSelectedMember("");
        setMemberStatement(null);
        setReportData([]);
        setSummary(null);
        setError("");
    }

    function handleClearFilters() {
        setSearch("");
        setStatus("");
        setPaymentStatus("");
        setPaymentMethod("");
        setStartDate("");
        setEndDate("");

        if (
            reportType ===
            REPORT_TYPES.MEMBER_STATEMENT
        ) {
            setSelectedMember("");
            setMemberSearch("");
            setMemberStatement(null);
        }
    }

    function handleExportCSV() {
        let rows = [];

        if (
            reportType ===
            REPORT_TYPES.CONTRIBUTIONS
        ) {
            rows = reportData.map((item) => ({
                "Member ID":
                    item.member_id ||
                    item.member_code ||
                    "",
                "Member Name":
                    item.full_name || "",
                Cycle:
                    item.cycle_name || "",
                "Expected Amount":
                    item.expected_amount || 0,
                "Total Paid":
                    item.total_paid || 0,
                Outstanding:
                    item.outstanding_amount ||
                    0,
                Status:
                    item.status || "",
                "Paid At":
                    item.paid_at || ""
            }));
        }

        if (
            reportType ===
            REPORT_TYPES.PAYMENTS
        ) {
            rows = reportData.map((item) => ({
                "Member ID":
                    item.member_id ||
                    item.member_code ||
                    "",
                "Member Name":
                    item.full_name || "",
                Cycle:
                    item.cycle_name || "",
                Amount: item.amount || 0,
                Method:
                    item.payment_method || "",
                Status:
                    item.payment_status || "",
                Reference:
                    item.payment_reference ||
                    "",
                "Paid At":
                    item.paid_at || ""
            }));
        }

        if (
            reportType ===
            REPORT_TYPES.FINES
        ) {
            rows = reportData.map((item) => ({
                "Member ID":
                    item.member_id ||
                    item.member_code ||
                    "",
                "Member Name":
                    item.full_name || "",
                Cycle:
                    item.cycle_name || "",
                Amount: item.amount || 0,
                Reason:
                    item.reason || "",
                Status:
                    item.status || "",
                "Applied At":
                    item.applied_at || "",
                "Paid At":
                    item.paid_at || ""
            }));
        }

        if (
            reportType ===
            REPORT_TYPES.MEMBER_STATEMENT
        ) {
            const statement =
                memberStatement;

            if (!statement) {
                return;
            }

            const contributions =
                statement.contributions ||
                [];

            rows = contributions.map(
                (item) => ({
                    "Member ID":
                        statement.member
                            ?.member_id ||
                        "",
                    "Member Name":
                        statement.member
                            ?.full_name ||
                        "",
                    Cycle:
                        item.cycle_name || "",
                    "Expected Amount":
                        item.expected_amount ||
                        0,
                    "Total Paid":
                        item.total_paid || 0,
                    Outstanding:
                        item.outstanding_amount ||
                        0,
                    Status:
                        item.status || "",
                    "Paid At":
                        item.paid_at || ""
                })
            );
        }

        if (!rows.length) {
            return;
        }

        const headers = Object.keys(
            rows[0]
        );

        const escapeCSV = (value) => {
            const stringValue = String(
                value ?? ""
            );

            return `"${stringValue.replaceAll(
                '"',
                '""'
            )}"`;
        };

        const csv = [
            headers
                .map(escapeCSV)
                .join(","),
            ...rows.map((row) =>
                headers
                    .map((header) =>
                        escapeCSV(
                            row[header]
                        )
                    )
                    .join(",")
            )
        ].join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        const date = new Date()
            .toISOString()
            .slice(0, 10);

        link.download = `bajim-${reportType}-report-${date}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    const currentReportTitle = useMemo(() => {
        switch (reportType) {
            case REPORT_TYPES.PAYMENTS:
                return "Payment Report";

            case REPORT_TYPES.FINES:
                return "Fine Report";

            case REPORT_TYPES.MEMBER_STATEMENT:
                return "Member Statement";

            default:
                return "Contribution Report";
        }
    }, [reportType]);

    const statementMember =
        memberStatement?.member ||
        memberStatement?.profile ||
        null;

    const statementContributions =
        memberStatement?.contributions ||
        [];

    const statementPayments =
        memberStatement?.payments ||
        [];

    const statementFines =
        memberStatement?.fines ||
        [];

    const exportDisabled =
        loading ||
        (reportType !==
            REPORT_TYPES.MEMBER_STATEMENT &&
            !reportData.length) ||
        (reportType ===
            REPORT_TYPES.MEMBER_STATEMENT &&
            !statementContributions.length);

    return (
        <div className="min-h-screen overflow-x-hidden bg-stone-50">
            <AdminSidebar />

            <div className="min-w-0 lg:pl-64">
                <AdminMobileNav />

                <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <div className="mx-auto max-w-7xl min-w-0">
                        {/* Page Header */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-green-700">
                                Administration
                            </p>

                            <div className="mt-1 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                                        Reports
                                    </h1>

                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
                                        Review contributions,
                                        payments, fines
                                        and individual
                                        member statements.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleExportCSV
                                    }
                                    disabled={
                                        exportDisabled
                                    }
                                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                                >
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Report Type Navigation */}
                        <div className="mb-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
                            <div className="grid min-w-[560px] grid-cols-4 gap-1 sm:min-w-0">
                                {[
                                    [
                                        REPORT_TYPES.CONTRIBUTIONS,
                                        "Contributions"
                                    ],
                                    [
                                        REPORT_TYPES.PAYMENTS,
                                        "Payments"
                                    ],
                                    [
                                        REPORT_TYPES.FINES,
                                        "Fines"
                                    ],
                                    [
                                        REPORT_TYPES.MEMBER_STATEMENT,
                                        "Member Statement"
                                    ]
                                ].map(
                                    ([
                                        type,
                                        label
                                    ]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                handleReportTypeChange(
                                                    type
                                                )
                                            }
                                            className={`min-h-11 rounded-xl px-3 py-3 text-sm font-medium transition ${
                                                reportType ===
                                                type
                                                    ? "bg-green-700 text-white"
                                                    : "text-stone-600 hover:bg-stone-100"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-stone-900">
                                        Filters
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-stone-500">
                                        Narrow the report
                                        using the available
                                        criteria.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleClearFilters
                                    }
                                    className="min-h-10 self-start text-sm font-medium text-green-700 hover:text-green-800"
                                >
                                    Clear filters
                                </button>
                            </div>

                            {reportType ===
                            REPORT_TYPES.MEMBER_STATEMENT ? (
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <div className="min-w-0 lg:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                            Find member
                                        </label>

                                        <input
                                            value={
                                                memberSearch
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setMemberSearch(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Search by member ID, name, phone or email"
                                            className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        />

                                        {membersError ? (
                                            <p className="mt-1 break-words text-xs leading-5 text-red-600">
                                                {
                                                    membersError
                                                }
                                            </p>
                                        ) : null}

                                        <select
                                            value={
                                                selectedMember
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSelectedMember(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                memberLoading
                                            }
                                            className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-stone-50"
                                        >
                                            <option value="">
                                                {memberLoading
                                                    ? "Loading members..."
                                                    : "Select a member"}
                                            </option>

                                            {members.map(
                                                (
                                                    member
                                                ) => (
                                                    <option
                                                        key={
                                                            member.profile_id ||
                                                            member.id
                                                        }
                                                        value={
                                                            member.profile_id ||
                                                            member.id
                                                        }
                                                    >
                                                        {member.member_id ||
                                                            member.member_code ||
                                                            ""}{" "}
                                                        —{" "}
                                                        {member.full_name ||
                                                            ""}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                                Start date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    startDate
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setStartDate(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="min-h-11 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                                End date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    endDate
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEndDate(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="min-h-11 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="min-w-0 sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                            Search
                                        </label>

                                        <input
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
                                            placeholder="Member name, member ID, phone or email"
                                            className="min-h-11 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>

                                    {reportType !==
                                    REPORT_TYPES.PAYMENTS ? (
                                        <div className="min-w-0">
                                            <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                                Status
                                            </label>

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
                                                className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            >
                                                <option value="">
                                                    All statuses
                                                </option>

                                                {reportType ===
                                                REPORT_TYPES.CONTRIBUTIONS ? (
                                                    <>
                                                        <option value="PENDING">
                                                            Pending
                                                        </option>
                                                        <option value="PAID">
                                                            Paid
                                                        </option>
                                                        <option value="PARTIAL">
                                                            Partial
                                                        </option>
                                                        <option value="OVERDUE">
                                                            Overdue
                                                        </option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="OUTSTANDING">
                                                            Outstanding
                                                        </option>
                                                        <option value="PAID">
                                                            Paid
                                                        </option>
                                                        <option value="WAIVED">
                                                            Waived
                                                        </option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="min-w-0">
                                            <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                                Payment status
                                            </label>

                                            <select
                                                value={
                                                    paymentStatus
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setPaymentStatus(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            >
                                                <option value="">
                                                    All statuses
                                                </option>
                                                <option value="PENDING">
                                                    Pending
                                                </option>
                                                <option value="VERIFIED">
                                                    Verified
                                                </option>
                                                <option value="REJECTED">
                                                    Rejected
                                                </option>
                                            </select>
                                        </div>
                                    )}

                                    {reportType ===
                                    REPORT_TYPES.PAYMENTS ? (
                                        <div className="min-w-0">
                                            <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                                Payment method
                                            </label>

                                            <select
                                                value={
                                                    paymentMethod
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setPaymentMethod(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
                                    ) : (
                                        <div className="hidden lg:block" />
                                    )}

                                    <div className="min-w-0">
                                        <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                            Start date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                startDate
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setStartDate(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <label className="mb-1.5 block text-sm font-medium text-stone-700">
                                            End date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                endDate
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEndDate(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Error */}
                        {error ? (
                            <div className="mb-6 break-words rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                {error}
                            </div>
                        ) : null}

                        {/* Member Statement */}
                        {reportType ===
                        REPORT_TYPES.MEMBER_STATEMENT ? (
                            <div className="space-y-6">
                                {statementMember ? (
                                    <>
                                        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                                            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                                                        Member
                                                    </p>

                                                    <h2 className="mt-1 break-words text-xl font-semibold text-stone-900">
                                                        {
                                                            statementMember.full_name
                                                        }
                                                    </h2>

                                                    <p className="mt-1 break-words text-sm text-stone-500">
                                                        {
                                                            statementMember.member_id
                                                        }
                                                    </p>
                                                </div>

                                                <div className="min-w-0 text-sm text-stone-500 sm:max-w-xs sm:text-right">
                                                    <p className="break-words">
                                                        {
                                                            statementMember.phone
                                                        }
                                                    </p>

                                                    <p className="mt-1 break-all">
                                                        {
                                                            statementMember.email
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                            <SummaryCard
                                                label="Expected"
                                                value={formatCurrency(
                                                    summary?.totalExpected
                                                )}
                                            />

                                            <SummaryCard
                                                label="Paid"
                                                value={formatCurrency(
                                                    summary?.totalPaid
                                                )}
                                            />

                                            <SummaryCard
                                                label="Outstanding Contribution"
                                                value={formatCurrency(
                                                    summary?.outstandingContribution
                                                )}
                                            />

                                            <SummaryCard
                                                label="Outstanding Fines"
                                                value={formatCurrency(
                                                    summary?.outstandingFines
                                                )}
                                            />

                                            <SummaryCard
                                                label="Total Outstanding"
                                                value={formatCurrency(
                                                    summary?.totalOutstanding
                                                )}
                                            />
                                        </div>

                                        {/* Statement Contributions */}
                                        <section>
                                            <div className="mb-3">
                                                <h2 className="font-semibold text-stone-900">
                                                    Contributions
                                                </h2>
                                            </div>

                                            <TableShell
                                                loading={
                                                    loading
                                                }
                                                empty={
                                                    !statementContributions.length
                                                }
                                            >
                                                <div className="hidden md:block">
                                                    <table className="min-w-[780px] w-full text-left text-sm">
                                                        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                                            <tr>
                                                                <th className="px-5 py-3">
                                                                    Cycle
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Expected
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Paid
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Outstanding
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Status
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Paid At
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className="divide-y divide-stone-100">
                                                            {statementContributions.map(
                                                                (
                                                                    item
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="hover:bg-stone-50"
                                                                    >
                                                                        <td className="px-5 py-4 font-medium text-stone-800">
                                                                            {item.cycle_name ||
                                                                                "—"}
                                                                        </td>

                                                                        <td className="px-5 py-4">
                                                                            {formatCurrency(
                                                                                item.expected_amount
                                                                            )}
                                                                        </td>

                                                                        <td className="px-5 py-4">
                                                                            {formatCurrency(
                                                                                item.total_paid
                                                                            )}
                                                                        </td>

                                                                        <td className="px-5 py-4">
                                                                            {formatCurrency(
                                                                                item.outstanding_amount
                                                                            )}
                                                                        </td>

                                                                        <td className="px-5 py-4">
                                                                            <StatusBadge
                                                                                status={
                                                                                    item.status
                                                                                }
                                                                            />
                                                                        </td>

                                                                        <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                            {formatDate(
                                                                                item.paid_at
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="divide-y divide-stone-100 md:hidden">
                                                    {statementContributions.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <MobileReportCard
                                                                key={
                                                                    item.id
                                                                }
                                                            >
                                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="break-words font-medium text-stone-800">
                                                                            {item.cycle_name ||
                                                                                "—"}
                                                                        </p>
                                                                    </div>

                                                                    <StatusBadge
                                                                        status={
                                                                            item.status
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <MobileField label="Expected">
                                                                        {formatCurrency(
                                                                            item.expected_amount
                                                                        )}
                                                                    </MobileField>

                                                                    <MobileField label="Paid">
                                                                        {formatCurrency(
                                                                            item.total_paid
                                                                        )}
                                                                    </MobileField>

                                                                    <MobileField label="Outstanding">
                                                                        {formatCurrency(
                                                                            item.outstanding_amount
                                                                        )}
                                                                    </MobileField>

                                                                    <MobileField label="Paid At">
                                                                        {formatDate(
                                                                            item.paid_at
                                                                        )}
                                                                    </MobileField>
                                                                </div>
                                                            </MobileReportCard>
                                                        )
                                                    )}
                                                </div>
                                            </TableShell>
                                        </section>

                                        {/* Statement Payments */}
                                        <section>
                                            <div className="mb-3">
                                                <h2 className="font-semibold text-stone-900">
                                                    Payments
                                                </h2>
                                            </div>

                                            <TableShell
                                                loading={
                                                    loading
                                                }
                                                empty={
                                                    !statementPayments.length
                                                }
                                            >
                                                <div className="hidden md:block">
                                                    <table className="min-w-[700px] w-full text-left text-sm">
                                                        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                                            <tr>
                                                                <th className="px-5 py-3">
                                                                    Amount
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Method
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Status
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Reference
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Paid At
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className="divide-y divide-stone-100">
                                                            {statementPayments.map(
                                                                (
                                                                    item
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        <td className="px-5 py-4 font-medium text-stone-800">
                                                                            {formatCurrency(
                                                                                item.amount
                                                                            )}
                                                                        </td>

                                                                        <td className="px-5 py-4">
                                                                            {String(
                                                                                item.payment_method ||
                                                                                    ""
                                                                            ).replaceAll(
                                                                                "_",
                                                                                " "
                                                                            ) ||
                                                                                "—"}
                                                                        </td>

                                                                        <td className="px-5 py-4">
                                                                            <StatusBadge
                                                                                status={
                                                                                    item.payment_status
                                                                                }
                                                                            />
                                                                        </td>

                                                                        <td className="max-w-[220px] px-5 py-4 text-stone-500">
                                                                            <span className="break-words">
                                                                                {item.payment_reference ||
                                                                                    "—"}
                                                                            </span>
                                                                        </td>

                                                                        <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                            {formatDateTime(
                                                                                item.paid_at
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="divide-y divide-stone-100 md:hidden">
                                                    {statementPayments.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <MobileReportCard
                                                                key={
                                                                    item.id
                                                                }
                                                            >
                                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                                    <MobileField
                                                                        label="Amount"
                                                                        emphasis
                                                                    >
                                                                        {formatCurrency(
                                                                            item.amount
                                                                        )}
                                                                    </MobileField>

                                                                    <StatusBadge
                                                                        status={
                                                                            item.payment_status
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <MobileField label="Method">
                                                                        {String(
                                                                            item.payment_method ||
                                                                                ""
                                                                        ).replaceAll(
                                                                            "_",
                                                                            " "
                                                                        ) ||
                                                                            "—"}
                                                                    </MobileField>

                                                                    <MobileField label="Paid At">
                                                                        {formatDateTime(
                                                                            item.paid_at
                                                                        )}
                                                                    </MobileField>

                                                                    <MobileField label="Reference">
                                                                        {item.payment_reference ||
                                                                            "—"}
                                                                    </MobileField>
                                                                </div>
                                                            </MobileReportCard>
                                                        )
                                                    )}
                                                </div>
                                            </TableShell>
                                        </section>

                                        {/* Statement Fines */}
                                        <section>
                                            <div className="mb-3">
                                                <h2 className="font-semibold text-stone-900">
                                                    Fines
                                                </h2>
                                            </div>

                                            <TableShell
                                                loading={
                                                    loading
                                                }
                                                empty={
                                                    !statementFines.length
                                                }
                                            >
                                                <div className="hidden md:block">
                                                    <table className="min-w-[700px] w-full text-left text-sm">
                                                        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                                            <tr>
                                                                <th className="px-5 py-3">
                                                                    Amount
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Reason
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Status
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Applied
                                                                </th>
                                                                <th className="px-5 py-3">
                                                                    Paid
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className="divide-y divide-stone-100">
                                                            {statementFines.map(
                                                                (
                                                                    item
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        <td className="px-5 py-4 font-medium text-stone-800">
                                                                            {formatCurrency(
                                                                                item.amount
                                                                            )}
                                                                        </td>

                                                                        <td className="max-w-[260px] px-5 py-4">
                                                                            <span className="break-words">
                                                                                {item.reason ||
                                                                                    "—"}
                                                                            </span>
                                                                        </td>

                                                                        <td className="px-5 py-4">
                                                                            <StatusBadge
                                                                                status={
                                                                                    item.status
                                                                                }
                                                                            />
                                                                        </td>

                                                                        <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                            {formatDate(
                                                                                item.applied_at
                                                                            )}
                                                                        </td>

                                                                        <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                            {formatDate(
                                                                                item.paid_at
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="divide-y divide-stone-100 md:hidden">
                                                    {statementFines.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <MobileReportCard
                                                                key={
                                                                    item.id
                                                                }
                                                            >
                                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                                    <MobileField
                                                                        label="Amount"
                                                                        emphasis
                                                                    >
                                                                        {formatCurrency(
                                                                            item.amount
                                                                        )}
                                                                    </MobileField>

                                                                    <StatusBadge
                                                                        status={
                                                                            item.status
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="grid gap-4">
                                                                    <MobileField label="Reason">
                                                                        {item.reason ||
                                                                            "—"}
                                                                    </MobileField>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <MobileField label="Applied">
                                                                            {formatDate(
                                                                                item.applied_at
                                                                            )}
                                                                        </MobileField>

                                                                        <MobileField label="Paid">
                                                                            {formatDate(
                                                                                item.paid_at
                                                                            )}
                                                                        </MobileField>
                                                                    </div>
                                                                </div>
                                                            </MobileReportCard>
                                                        )
                                                    )}
                                                </div>
                                            </TableShell>
                                        </section>
                                    </>
                                ) : (
                                    <div className="rounded-2xl border border-stone-200 bg-white px-5 py-14 text-center shadow-sm sm:px-6 sm:py-16">
                                        <p className="font-medium text-stone-800">
                                            Select a member
                                        </p>

                                        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-500">
                                            Choose a member
                                            above to view
                                            their contribution,
                                            payment and fine
                                            statement.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Report Summary */}
                                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <SummaryCard
                                        label="Report"
                                        value={
                                            currentReportTitle
                                        }
                                        description={`${pagination.total || 0} record(s)`}
                                    />

                                    <SummaryCard
                                        label="Records"
                                        value={
                                            pagination.total ||
                                            reportData.length
                                        }
                                        description="Matching records"
                                    />

                                    <SummaryCard
                                        label="Date From"
                                        value={
                                            startDate ||
                                            "All"
                                        }
                                    />

                                    <SummaryCard
                                        label="Date To"
                                        value={
                                            endDate ||
                                            "All"
                                        }
                                    />
                                </div>

                                {/* Contributions */}
                                <TableShell
                                    loading={
                                        loading
                                    }
                                    empty={
                                        !reportData.length
                                    }
                                >
                                    {reportType ===
                                    REPORT_TYPES.CONTRIBUTIONS ? (
                                        <>
                                            <div className="hidden md:block">
                                                <table className="min-w-[900px] w-full text-left text-sm">
                                                    <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                                        <tr>
                                                            <th className="px-5 py-3">
                                                                Member
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Cycle
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Expected
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Paid
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Outstanding
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Status
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Paid At
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-stone-100">
                                                        {reportData.map(
                                                            (
                                                                item
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="hover:bg-stone-50"
                                                                >
                                                                    <td className="px-5 py-4">
                                                                        <div className="font-medium text-stone-800">
                                                                            {item.full_name ||
                                                                                "—"}
                                                                        </div>

                                                                        <div className="mt-0.5 break-all text-xs text-stone-500">
                                                                            {item.member_code ||
                                                                                item.member_id ||
                                                                                ""}
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        {item.cycle_name ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                                        {formatCurrency(
                                                                            item.expected_amount
                                                                        )}
                                                                    </td>

                                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                                        {formatCurrency(
                                                                            item.total_paid
                                                                        )}
                                                                    </td>

                                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                                        {formatCurrency(
                                                                            item.outstanding_amount
                                                                        )}
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        <StatusBadge
                                                                            status={
                                                                                item.status
                                                                            }
                                                                        />
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                        {formatDate(
                                                                            item.paid_at
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="divide-y divide-stone-100 md:hidden">
                                                {reportData.map(
                                                    (
                                                        item
                                                    ) => (
                                                        <MobileReportCard
                                                            key={
                                                                item.id
                                                            }
                                                        >
                                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="break-words font-medium text-stone-800">
                                                                        {item.full_name ||
                                                                            "—"}
                                                                    </p>

                                                                    <p className="mt-1 break-all text-xs text-stone-500">
                                                                        {item.member_code ||
                                                                            item.member_id ||
                                                                            "—"}
                                                                    </p>
                                                                </div>

                                                                <StatusBadge
                                                                    status={
                                                                        item.status
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="mb-4">
                                                                <MobileField
                                                                    label="Cycle"
                                                                    emphasis
                                                                >
                                                                    {item.cycle_name ||
                                                                        "—"}
                                                                </MobileField>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <MobileField label="Expected">
                                                                    {formatCurrency(
                                                                        item.expected_amount
                                                                    )}
                                                                </MobileField>

                                                                <MobileField label="Paid">
                                                                    {formatCurrency(
                                                                        item.total_paid
                                                                    )}
                                                                </MobileField>

                                                                <MobileField label="Outstanding">
                                                                    {formatCurrency(
                                                                        item.outstanding_amount
                                                                    )}
                                                                </MobileField>

                                                                <MobileField label="Paid At">
                                                                    {formatDate(
                                                                        item.paid_at
                                                                    )}
                                                                </MobileField>
                                                            </div>
                                                        </MobileReportCard>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    ) : null}

                                    {/* Payments */}
                                    {reportType ===
                                    REPORT_TYPES.PAYMENTS ? (
                                        <>
                                            <div className="hidden md:block">
                                                <table className="min-w-[950px] w-full text-left text-sm">
                                                    <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                                        <tr>
                                                            <th className="px-5 py-3">
                                                                Member
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Cycle
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Amount
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Method
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Status
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Reference
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Paid At
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-stone-100">
                                                        {reportData.map(
                                                            (
                                                                item
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="hover:bg-stone-50"
                                                                >
                                                                    <td className="px-5 py-4">
                                                                        <div className="font-medium text-stone-800">
                                                                            {item.full_name ||
                                                                                "—"}
                                                                        </div>

                                                                        <div className="mt-0.5 break-all text-xs text-stone-500">
                                                                            {item.member_code ||
                                                                                item.member_id ||
                                                                                ""}
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        {item.cycle_name ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                                                                        {formatCurrency(
                                                                            item.amount
                                                                        )}
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        {String(
                                                                            item.payment_method ||
                                                                                ""
                                                                        ).replaceAll(
                                                                            "_",
                                                                            " "
                                                                        ) ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        <StatusBadge
                                                                            status={
                                                                                item.payment_status
                                                                            }
                                                                        />
                                                                    </td>

                                                                    <td className="max-w-[220px] px-5 py-4 text-stone-500">
                                                                        <span className="break-words">
                                                                            {item.payment_reference ||
                                                                                "—"}
                                                                        </span>
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                        {formatDateTime(
                                                                            item.paid_at
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="divide-y divide-stone-100 md:hidden">
                                                {reportData.map(
                                                    (
                                                        item
                                                    ) => (
                                                        <MobileReportCard
                                                            key={
                                                                item.id
                                                            }
                                                        >
                                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="break-words font-medium text-stone-800">
                                                                        {item.full_name ||
                                                                            "—"}
                                                                    </p>

                                                                    <p className="mt-1 break-all text-xs text-stone-500">
                                                                        {item.member_code ||
                                                                            item.member_id ||
                                                                            "—"}
                                                                    </p>
                                                                </div>

                                                                <StatusBadge
                                                                    status={
                                                                        item.payment_status
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="mb-4">
                                                                <MobileField
                                                                    label="Cycle"
                                                                    emphasis
                                                                >
                                                                    {item.cycle_name ||
                                                                        "—"}
                                                                </MobileField>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <MobileField label="Amount">
                                                                    {formatCurrency(
                                                                        item.amount
                                                                    )}
                                                                </MobileField>

                                                                <MobileField label="Method">
                                                                    {String(
                                                                        item.payment_method ||
                                                                            ""
                                                                    ).replaceAll(
                                                                        "_",
                                                                        " "
                                                                    ) ||
                                                                        "—"}
                                                                </MobileField>

                                                                <MobileField label="Reference">
                                                                    {item.payment_reference ||
                                                                        "—"}
                                                                </MobileField>

                                                                <MobileField label="Paid At">
                                                                    {formatDateTime(
                                                                        item.paid_at
                                                                    )}
                                                                </MobileField>
                                                            </div>
                                                        </MobileReportCard>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    ) : null}

                                    {/* Fines */}
                                    {reportType ===
                                    REPORT_TYPES.FINES ? (
                                        <>
                                            <div className="hidden md:block">
                                                <table className="min-w-[950px] w-full text-left text-sm">
                                                    <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                                                        <tr>
                                                            <th className="px-5 py-3">
                                                                Member
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Cycle
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Amount
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Reason
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Status
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Applied
                                                            </th>
                                                            <th className="px-5 py-3">
                                                                Paid
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-stone-100">
                                                        {reportData.map(
                                                            (
                                                                item
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="hover:bg-stone-50"
                                                                >
                                                                    <td className="px-5 py-4">
                                                                        <div className="font-medium text-stone-800">
                                                                            {item.full_name ||
                                                                                "—"}
                                                                        </div>

                                                                        <div className="mt-0.5 break-all text-xs text-stone-500">
                                                                            {item.member_code ||
                                                                                item.member_id ||
                                                                                ""}
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        {item.cycle_name ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                                                                        {formatCurrency(
                                                                            item.amount
                                                                        )}
                                                                    </td>

                                                                    <td className="max-w-[260px] px-5 py-4">
                                                                        <span className="break-words">
                                                                            {item.reason ||
                                                                                "—"}
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        <StatusBadge
                                                                            status={
                                                                                item.status
                                                                            }
                                                                        />
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                        {formatDate(
                                                                            item.applied_at
                                                                        )}
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                                                                        {formatDate(
                                                                            item.paid_at
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="divide-y divide-stone-100 md:hidden">
                                                {reportData.map(
                                                    (
                                                        item
                                                    ) => (
                                                        <MobileReportCard
                                                            key={
                                                                item.id
                                                            }
                                                        >
                                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="break-words font-medium text-stone-800">
                                                                        {item.full_name ||
                                                                            "—"}
                                                                    </p>

                                                                    <p className="mt-1 break-all text-xs text-stone-500">
                                                                        {item.member_code ||
                                                                            item.member_id ||
                                                                            "—"}
                                                                    </p>
                                                                </div>

                                                                <StatusBadge
                                                                    status={
                                                                        item.status
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-4">
                                                                <MobileField
                                                                    label="Cycle"
                                                                    emphasis
                                                                >
                                                                    {item.cycle_name ||
                                                                        "—"}
                                                                </MobileField>

                                                                <MobileField label="Reason">
                                                                    {item.reason ||
                                                                        "—"}
                                                                </MobileField>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <MobileField label="Amount">
                                                                        {formatCurrency(
                                                                            item.amount
                                                                        )}
                                                                    </MobileField>

                                                                    <MobileField label="Applied">
                                                                        {formatDate(
                                                                            item.applied_at
                                                                        )}
                                                                    </MobileField>

                                                                    <MobileField label="Paid">
                                                                        {formatDate(
                                                                            item.paid_at
                                                                        )}
                                                                    </MobileField>
                                                                </div>
                                                            </div>
                                                        </MobileReportCard>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    ) : null}

                                    <Pagination
                                        page={
                                            pagination.page ||
                                            1
                                        }
                                        totalPages={
                                            pagination.totalPages ||
                                            0
                                        }
                                        onChange={
                                            loadReport
                                        }
                                    />
                                </TableShell>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
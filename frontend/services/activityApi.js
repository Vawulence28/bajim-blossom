const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

/* =========================================================
   INTERNAL REQUEST HELPER
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {
    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                credentials: "include",
                ...options,
                headers: {
                    "Content-Type":
                        "application/json",
                    ...(options.headers || {})
                }
            }
        );

    let result = null;

    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Unable to complete the request."
        );
    }

    return result;
}

/* =========================================================
   LIST ACTIVITY LOGS
========================================================= */

export async function getActivityLogs({
    search = "",
    action = "",
    entityType = "",
    startDate = "",
    endDate = "",
    page = 1,
    pageSize = 20
} = {}) {
    const params =
        new URLSearchParams();

    if (search.trim()) {
        params.set(
            "search",
            search.trim()
        );
    }

    if (action) {
        params.set(
            "action",
            action
        );
    }

    if (entityType) {
        params.set(
            "entityType",
            entityType
        );
    }

    if (startDate) {
        params.set(
            "startDate",
            startDate
        );
    }

    if (endDate) {
        params.set(
            "endDate",
            endDate
        );
    }

    params.set(
        "page",
        String(page)
    );

    params.set(
        "pageSize",
        String(pageSize)
    );

    const queryString =
        params.toString();

    return apiRequest(
        `/api/admin/activity?${queryString}`
    );
}

/* =========================================================
   GET SINGLE ACTIVITY LOG
========================================================= */

export async function getActivityLog(
    activityId
) {
    if (!activityId) {
        throw new Error(
            "Activity log ID is required."
        );
    }

    return apiRequest(
        `/api/admin/activity/${encodeURIComponent(
            activityId
        )}`
    );
}

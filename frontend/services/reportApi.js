const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

async function request(
    endpoint,
    options = {}
) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            "Unable to complete the request."
        );
    }

    return data;
}

function buildQueryString(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(
        ([key, value]) => {
            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                searchParams.set(
                    key,
                    String(value)
                );
            }
        }
    );

    const query =
        searchParams.toString();

    return query ? `?${query}` : "";
}

export async function getContributionReport(
    params = {}
) {
    const query =
        buildQueryString(params);

    return request(
        `/api/admin/reports/contributions${query}`
    );
}

export async function getPaymentReport(
    params = {}
) {
    const query =
        buildQueryString(params);

    return request(
        `/api/admin/reports/payments${query}`
    );
}

export async function getFineReport(
    params = {}
) {
    const query =
        buildQueryString(params);

    return request(
        `/api/admin/reports/fines${query}`
    );
}

export async function getReportMembers(
    params = {}
) {
    const query =
        buildQueryString(params);

    return request(
        `/api/admin/reports/members${query}`
    );
}

export async function getMemberStatement(
    memberId,
    params = {}
) {
    if (!memberId) {
        throw new Error(
            "A member is required."
        );
    }

    const query =
        buildQueryString(params);

    return request(
        `/api/admin/reports/member-statement/${memberId}${query}`
    );
}

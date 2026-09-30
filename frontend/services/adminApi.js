const API_BASE_URL = "";

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
                ...(options.body
                    ? {
                          "Content-Type":
                              "application/json"
                      }
                    : {}),
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
        const error = new Error(
            data?.message ||
                "Something went wrong while contacting the server."
        );

        error.status =
            response.status;

        error.data = data;

        throw error;
    }

    return data;
}

export async function getAdminMe() {
    return request(
        "/api/admin/me"
    );
}

export async function getAdminDashboard() {
    return request(
        "/api/admin/dashboard"
    );
}

/* =========================================================
   MEMBERS
========================================================= */

export async function getAdminMembers({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const params =
        new URLSearchParams();

    if (search.trim()) {
        params.set(
            "search",
            search.trim()
        );
    }

    if (status) {
        params.set(
            "status",
            status
        );
    }

    params.set(
        "page",
        String(page)
    );

    params.set(
        "limit",
        String(limit)
    );

    const queryString =
        params.toString();

    return request(
        `/api/admin/members?${queryString}`
    );
}

export async function getAdminMember(
    memberId
) {
    return request(
        `/api/admin/members/${memberId}`
    );
}

export async function updateAdminMemberStatus(
    memberId,
    status
) {
    return request(
        `/api/admin/members/${memberId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
}

/* =========================================================
   CONTRIBUTION CYCLES
========================================================= */

export async function getAdminCycles({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const params =
        new URLSearchParams();

    if (search.trim()) {
        params.set(
            "search",
            search.trim()
        );
    }

    if (status) {
        params.set(
            "status",
            status
        );
    }

    params.set(
        "page",
        String(page)
    );

    params.set(
        "limit",
        String(limit)
    );

    const queryString =
        params.toString();

    return request(
        `/api/admin/cycles?${queryString}`
    );
}

export async function getAdminCycle(
    cycleId
) {
    return request(
        `/api/admin/cycles/${cycleId}`
    );
}

export async function createAdminCycle(
    cycleData
) {
    return request(
        "/api/admin/cycles",
        {
            method: "POST",
            body: JSON.stringify(
                cycleData
            )
        }
    );
}

export async function updateAdminCycle(
    cycleId,
    cycleData
) {
    return request(
        `/api/admin/cycles/${cycleId}`,
        {
            method: "PATCH",
            body: JSON.stringify(
                cycleData
            )
        }
    );
}

export async function updateAdminCycleStatus(
    cycleId,
    status
) {
    return request(
        `/api/admin/cycles/${cycleId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
}

/* =========================================================
   PAYMENTS
========================================================= */

export async function getAdminPayments({
    search = "",
    status = "",
    method = "",
    page = 1,
    limit = 20
} = {}) {
    const params =
        new URLSearchParams();

    if (search.trim()) {
        params.set(
            "search",
            search.trim()
        );
    }

    if (status) {
        params.set(
            "status",
            status
        );
    }

    if (method) {
        params.set(
            "method",
            method
        );
    }

    params.set(
        "page",
        String(page)
    );

    params.set(
        "limit",
        String(limit)
    );

    return request(
        `/api/admin/payments?${params.toString()}`
    );
}

export async function getAdminPayment(
    paymentId
) {
    return request(
        `/api/admin/payments/${paymentId}`
    );
}

export async function getAdminPaymentContributions({
    search = "",
    limit = 50
} = {}) {
    const params =
        new URLSearchParams();

    if (search.trim()) {
        params.set(
            "search",
            search.trim()
        );
    }

    params.set(
        "limit",
        String(limit)
    );

    return request(
        `/api/admin/payments/contributions?${params.toString()}`
    );
}

export async function createAdminPayment(
    paymentData
) {
    return request(
        "/api/admin/payments",
        {
            method: "POST",
            body: JSON.stringify(
                paymentData
            )
        }
    );
}

export async function updateAdminPaymentStatus(
    paymentId,
    status
) {
    return request(
        `/api/admin/payments/${paymentId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
}

/* =========================================================
   FINES
========================================================= */

export async function getAdminFines({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    if (status) {
        params.set("status", status);
    }

    params.set("page", String(page));
    params.set("limit", String(limit));

    return request(
        `/api/admin/fines?${params.toString()}`
    );
}

export async function getAdminFine(fineId) {
    return request(
        `/api/admin/fines/${fineId}`
    );
}

export async function getAdminFineContributions({
    search = "",
    limit = 50
} = {}) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    params.set("limit", String(limit));

    return request(
        `/api/admin/fines/contributions?${params.toString()}`
    );
}

export async function createAdminFine(fineData) {
    return request(
        "/api/admin/fines",
        {
            method: "POST",
            body: JSON.stringify(fineData)
        }
    );
}

export async function updateAdminFine(
    fineId,
    fineData
) {
    return request(
        `/api/admin/fines/${fineId}`,
        {
            method: "PATCH",
            body: JSON.stringify(fineData)
        }
    );
}

export async function updateAdminFineStatus(
    fineId,
    status,
    notes = null
) {
    return request(
        `/api/admin/fines/${fineId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status,
                notes
            })
        }
    );
}

/* =========================================================
   MEMBER ITEMS
========================================================= */

export async function getAdminItems({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    if (status) {
        params.set("status", status);
    }

    params.set("page", String(page));
    params.set("limit", String(limit));

    return request(
        `/api/admin/items?${params.toString()}`
    );
}

export async function getAdminItem(itemId) {
    return request(
        `/api/admin/items/${itemId}`
    );
}

export async function getAdminItemMembers({
    search = "",
    limit = 50
} = {}) {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    params.set("limit", String(limit));

    return request(
        `/api/admin/items/members?${params.toString()}`
    );
}

export async function createAdminItem(itemData) {
    return request(
        "/api/admin/items",
        {
            method: "POST",
            body: JSON.stringify(itemData)
        }
    );
}

export async function updateAdminItem(
    itemId,
    itemData
) {
    return request(
        `/api/admin/items/${itemId}`,
        {
            method: "PATCH",
            body: JSON.stringify(itemData)
        }
    );
}

export async function updateAdminItemStatus(
    itemId,
    status,
    notes = null
) {
    return request(
        `/api/admin/items/${itemId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status,
                notes
            })
        }
    );
}

export async function getAdminAnnouncements({
    search = "",
    status = "",
    category = "",
    page = 1,
    limit = 20
} = {}) {
    const params = new URLSearchParams();

    if (search) {
        params.set(
            "search",
            search
        );
    }

    if (status) {
        params.set(
            "status",
            status
        );
    }

    if (category) {
        params.set(
            "category",
            category
        );
    }

    params.set(
        "page",
        String(page)
    );

    params.set(
        "limit",
        String(limit)
    );

    const queryString =
        params.toString();

    return request(
        `/api/admin/announcements?${queryString}`,
        {
            method: "GET"
        }
    );
}

export async function getAdminAnnouncement(
    announcementId
) {
    return request(
        `/api/admin/announcements/${announcementId}`,
        {
            method: "GET"
        }
    );
}

export async function createAdminAnnouncement(
    data
) {
    return request(
        "/api/admin/announcements",
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}

export async function updateAdminAnnouncement(
    announcementId,
    data
) {
    return request(
        `/api/admin/announcements/${announcementId}`,
        {
            method: "PATCH",
            body: JSON.stringify(data)
        }
    );
}

export async function updateAdminAnnouncementStatus(
    announcementId,
    status
) {
    return request(
        `/api/admin/announcements/${announcementId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
}

/* =========================================================
   SETTINGS
========================================================= */

export async function getAdminSettings() {
    return request(
        "/api/admin/settings"
    );
}

export async function getAdminSetting(
    settingKey
) {
    return request(
        `/api/admin/settings/${encodeURIComponent(
            settingKey
        )}`
    );
}

export async function updateAdminSetting(
    settingKey,
    value
) {
    return request(
        `/api/admin/settings/${encodeURIComponent(
            settingKey
        )}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                value
            })
        }
    );
}


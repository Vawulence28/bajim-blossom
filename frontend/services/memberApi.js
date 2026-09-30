const API_BASE_URL = "";

async function request(endpoint, options = {}) {
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
        const error = new Error(
            data?.message ||
            "Something went wrong while contacting the server."
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}

export async function getMemberProfile() {
    return request("/api/member/profile");
}

export async function updateMemberProfile(payload) {
    return request("/api/member/profile", {
        method: "PATCH",
        body: JSON.stringify(payload)
    });
}

export async function getMemberContributions() {
    return request("/api/member/contributions");
}

export async function getMemberItems() {
    return request("/api/member/items");
}

export async function getMemberStatus() {
    return request("/api/member/status");
}

export async function getMemberAnnouncements() {
    return request("/api/member/announcements");
}

export async function getMemberDashboard() {
    return request("/api/member/dashboard");
}

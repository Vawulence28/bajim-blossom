import crypto from "crypto";

export function generateSecureToken(byteLength = 32) {
    return crypto.randomBytes(byteLength).toString("hex");
}

export function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

export function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

export function normalizePhone(phone) {
    return phone.trim();
}

export function normalizeName(name) {
    return name
        .trim()
        .replace(/\s+/g, " ");
}

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    return req.socket?.remoteAddress || null;
}

export function getUserAgent(req) {
    return req.headers["user-agent"] || null;
}
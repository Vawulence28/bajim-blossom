import {
    authenticateSession
} from "../services/session.service.js";

import {
    SESSION_COOKIE_NAME
} from "../utils/cookies.js";

export async function requireAuthentication(
    req,
    res,
    next
) {
    try {
        const token =
            req.cookies?.[SESSION_COOKIE_NAME];

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication is required."
            });
        }

        const session =
            await authenticateSession(token);

        if (!session) {
            return res.status(401).json({
                success: false,
                message:
                    "Your session is invalid or has expired."
            });
        }

        req.auth = {
            sessionId: session.id,
            userId: session.user_id,
            memberId: session.member_id,
            fullName: session.full_name,
            phone: session.phone,
            email: session.email,
            address: session.address,
            emergencyContact:
                session.emergency_contact,
            role: session.role,
            status: session.status
        };

        next();
    } catch (error) {
        next(error);
    }
}

export function requireAdmin(
    req,
    res,
    next
) {
    if (!req.auth) {
        return res.status(401).json({
            success: false,
            message:
                "Authentication is required."
        });
    }

    const allowedRoles = [
        "ADMIN",
        "SUPER_ADMIN"
    ];

    if (!allowedRoles.includes(req.auth.role)) {
        return res.status(403).json({
            success: false,
            message:
                "Administrator access is required."
        });
    }

    next();
}
import {
    createSession,
    findActiveSessionByHash,
    updateSessionLastUsed,
    revokeSession
} from "../models/session.model.js";

import {
    generateSecureToken,
    hashToken
} from "../utils/auth.utils.js";


const SESSION_DURATION_DAYS = 7;


export async function createUserSession(
    client,
    {
        userId,
        ipAddress,
        userAgent
    }
) {
    const rawToken =
        generateSecureToken(48);

    const sessionTokenHash =
        hashToken(rawToken);

    const expiresAt =
        new Date(
            Date.now() +
            SESSION_DURATION_DAYS *
            24 *
            60 *
            60 *
            1000
        );

    const session =
        await createSession(
            client,
            {
                userId,
                sessionTokenHash,
                expiresAt,
                ipAddress,
                userAgent
            }
        );

    return {
        ...session,
        rawToken
    };
}


export async function authenticateSession(
    rawToken
) {
    if (
        !rawToken ||
        typeof rawToken !== "string"
    ) {
        return null;
    }

    const sessionTokenHash =
        hashToken(rawToken);

    const session =
        await findActiveSessionByHash(
            sessionTokenHash
        );

    if (!session) {
        return null;
    }

    await updateSessionLastUsed(
        session.id
    );

    return session;
}


export async function logoutUser(
    rawToken
) {
    if (
        !rawToken ||
        typeof rawToken !== "string"
    ) {
        return false;
    }

    const sessionTokenHash =
        hashToken(rawToken);

    return revokeSession(
        sessionTokenHash
    );
}
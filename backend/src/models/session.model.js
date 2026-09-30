import { query } from "../config/database.js";

export async function createSession(
    client,
    {
        userId,
        sessionTokenHash,
        expiresAt,
        ipAddress,
        userAgent
    }
) {
    const result = await client.query(
        `
        INSERT INTO baj_sessions (
            user_id,
            session_token_hash,
            expires_at,
            ip_address,
            user_agent
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            user_id,
            expires_at,
            created_at,
            last_used_at,
            revoked_at
        `,
        [
            userId,
            sessionTokenHash,
            expiresAt,
            ipAddress || null,
            userAgent || null
        ]
    );

    return result.rows[0];
}

export async function findActiveSessionByHash(
    sessionTokenHash
) {
    const result = await query(
        `
        SELECT
            s.id,
            s.user_id,
            s.expires_at,
            s.created_at,
            s.last_used_at,
            s.revoked_at,

            p.member_id,
            p.full_name,
            p.phone,
            p.email,
            p.address,
            p.emergency_contact,
            p.role,
            p.status

        FROM baj_sessions s

        INNER JOIN baj_profiles p
            ON p.user_id = s.user_id

        INNER JOIN baj_users u
            ON u.id = s.user_id

        WHERE s.session_token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > NOW()
        AND u.is_active = TRUE

        LIMIT 1
        `,
        [sessionTokenHash]
    );

    return result.rows[0] || null;
}

export async function updateSessionLastUsed(
    sessionId
) {
    await query(
        `
        UPDATE baj_sessions
        SET last_used_at = NOW()
        WHERE id = $1
        `,
        [sessionId]
    );
}

export async function revokeSession(sessionTokenHash) {
    const result = await query(
        `
        UPDATE baj_sessions
        SET revoked_at = NOW()
        WHERE session_token_hash = $1
        AND revoked_at IS NULL
        RETURNING id
        `,
        [sessionTokenHash]
    );

    return result.rowCount > 0;
}

export async function revokeAllUserSessions(userId) {
    await query(
        `
        UPDATE baj_sessions
        SET revoked_at = NOW()
        WHERE user_id = $1
        AND revoked_at IS NULL
        `,
        [userId]
    );
}

export async function deleteExpiredSessions() {
    const result = await query(
        `
        DELETE FROM baj_sessions
        WHERE expires_at < NOW()
        OR revoked_at < NOW() - INTERVAL '30 days'
        `
    );

    return result.rowCount;
}
import { query } from "../config/database.js";

export async function createUser(
    client,
    {
        passwordHash
    }
) {
    const result = await client.query(
        `
        INSERT INTO baj_users (
            password_hash
        )
        VALUES ($1)
        RETURNING
            id,
            password_hash,
            is_active,
            last_login_at,
            created_at,
            updated_at
        `,
        [passwordHash]
    );

    return result.rows[0];
}

export async function findUserById(userId) {
    const result = await query(
        `
        SELECT
            id,
            password_hash,
            is_active,
            last_login_at,
            created_at,
            updated_at
        FROM baj_users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0] || null;
}

export async function findUserByEmail(email) {
    const result = await query(
        `
        SELECT
            u.id,
            u.password_hash,
            u.is_active,
            u.last_login_at,
            u.created_at,
            u.updated_at,

            p.member_id,
            p.full_name,
            p.phone,
            p.email,
            p.address,
            p.emergency_contact,
            p.role,
            p.status,
            p.joined_at

        FROM baj_users u

        INNER JOIN baj_profiles p
            ON p.user_id = u.id

        WHERE LOWER(p.email) = LOWER($1)

        LIMIT 1
        `,
        [email]
    );

    return result.rows[0] || null;
}

export async function updateLastLogin(userId) {
    const result = await query(
        `
        UPDATE baj_users
        SET last_login_at = NOW()
        WHERE id = $1
        RETURNING last_login_at
        `,
        [userId]
    );

    return result.rows[0] || null;
}
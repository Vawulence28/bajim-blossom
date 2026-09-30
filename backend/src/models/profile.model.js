import { query } from "../config/database.js";

export async function createProfile(
    client,
    {
        userId,
        fullName,
        phone,
        email,
        address,
        emergencyContact
    }
) {
    const result = await client.query(
        `
        INSERT INTO baj_profiles (
            user_id,
            full_name,
            phone,
            email,
            address,
            emergency_contact,
            role,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            'MEMBER',
            'PENDING_APPROVAL'
        )
        RETURNING
            id,
            user_id,
            member_id,
            full_name,
            phone,
            email,
            address,
            emergency_contact,
            role,
            status,
            joined_at,
            created_at,
            updated_at
        `,
        [
            userId,
            fullName,
            phone,
            email,
            address || null,
            emergencyContact || null
        ]
    );

    return result.rows[0];
}

export async function findProfileByUserId(userId) {
    const result = await query(
        `
        SELECT
            id,
            user_id,
            member_id,
            full_name,
            phone,
            email,
            address,
            emergency_contact,
            role,
            status,
            joined_at,
            created_at,
            updated_at
        FROM baj_profiles
        WHERE user_id = $1
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0] || null;
}

export async function findProfileByEmail(email) {
    const result = await query(
        `
        SELECT
            id,
            user_id,
            member_id,
            full_name,
            phone,
            email,
            address,
            emergency_contact,
            role,
            status,
            joined_at,
            created_at,
            updated_at
        FROM baj_profiles
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [email]
    );

    return result.rows[0] || null;
}
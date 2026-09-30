import { query } from "../config/database.js";

export async function findMemberProfileByUserId(userId) {
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

export async function updateMemberProfileByUserId(
    userId,
    {
        fullName,
        phone,
        address,
        emergencyContact
    }
) {
    const result = await query(
        `
        UPDATE baj_profiles
        SET
            full_name = $1,
            phone = $2,
            address = $3,
            emergency_contact = $4,
            updated_at = NOW()
        WHERE user_id = $5
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
            fullName,
            phone,
            address ?? null,
            emergencyContact ?? null,
            userId
        ]
    );

    return result.rows[0] || null;
}

export async function findMemberProfileByMemberId(memberId) {
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
        WHERE member_id = $1
        LIMIT 1
        `,
        [memberId]
    );

    return result.rows[0] || null;
}
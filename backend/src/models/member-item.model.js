import { query } from "../config/database.js";

export async function findMemberItems(memberProfileId) {
    const result = await query(
        `
        SELECT
            id,
            member_id,
            item_name,
            item_description,
            quantity,
            status,
            assigned_at,
            collected_at,
            notes,
            created_at,
            updated_at
        FROM baj_member_items
        WHERE member_id = $1
        ORDER BY assigned_at DESC, created_at DESC
        `,
        [memberProfileId]
    );

    return result.rows;
}

export async function findMemberItemSummary(memberProfileId) {
    const result = await query(
        `
        SELECT
            COUNT(*)::INTEGER AS total_items,

            COUNT(*) FILTER (
                WHERE status = 'ASSIGNED'
            )::INTEGER AS assigned_items,

            COUNT(*) FILTER (
                WHERE status = 'COLLECTED'
            )::INTEGER AS collected_items,

            COUNT(*) FILTER (
                WHERE status = 'CANCELLED'
            )::INTEGER AS cancelled_items,

            COALESCE(SUM(quantity), 0)::INTEGER AS total_quantity

        FROM baj_member_items

        WHERE member_id = $1
        `,
        [memberProfileId]
    );

    return result.rows[0];
}
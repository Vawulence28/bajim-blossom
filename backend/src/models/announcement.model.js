import { query } from "../config/database.js";

export async function findPublishedAnnouncements() {
    const result = await query(
        `
        SELECT
            id,
            title,
            content,
            category,
            published_at,
            created_at,
            updated_at
        FROM baj_announcements
        WHERE status = 'PUBLISHED'
          AND published_at IS NOT NULL
          AND published_at <= NOW()
        ORDER BY published_at DESC, created_at DESC
        `,
        []
    );

    return result.rows;
}
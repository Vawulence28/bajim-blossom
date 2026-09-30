import { query } from "../config/database.js";

const ANNOUNCEMENT_STATUSES = [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED"
];

const ANNOUNCEMENT_CATEGORIES = [
    "GENERAL",
    "CONTRIBUTION",
    "PAYMENT",
    "MEETING",
    "ITEMS",
    "IMPORTANT"
];

function normalizePagination(
    page = 1,
    limit = 20
) {
    const parsedPage =
        Number.parseInt(page, 10);

    const parsedLimit =
        Number.parseInt(limit, 10);

    const safePage =
        Number.isInteger(parsedPage) &&
        parsedPage > 0
            ? parsedPage
            : 1;

    const safeLimit =
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0 &&
        parsedLimit <= 100
            ? parsedLimit
            : 20;

    return {
        page: safePage,
        limit: safeLimit,
        offset:
            (safePage - 1) *
            safeLimit
    };
}

function validateStatus(status) {
    if (
        !ANNOUNCEMENT_STATUSES.includes(
            status
        )
    ) {
        throw new Error(
            `Invalid announcement status. Allowed statuses: ${ANNOUNCEMENT_STATUSES.join(", ")}.`
        );
    }
}

function validateCategory(category) {
    if (
        !ANNOUNCEMENT_CATEGORIES.includes(
            category
        )
    ) {
        throw new Error(
            `Invalid announcement category. Allowed categories: ${ANNOUNCEMENT_CATEGORIES.join(", ")}.`
        );
    }
}

function validateTitle(title) {
    if (
        !title ||
        !title.trim()
    ) {
        throw new Error(
            "Announcement title is required."
        );
    }

    if (
        title.trim().length > 255
    ) {
        throw new Error(
            "Announcement title cannot exceed 255 characters."
        );
    }
}

function validateContent(content) {
    if (
        !content ||
        !content.trim()
    ) {
        throw new Error(
            "Announcement content is required."
        );
    }
}

/*
 * Resolve the authenticated user's
 * profile.
 *
 * Authentication provides:
 *
 * req.auth.userId
 *        ↓
 * baj_profiles.user_id
 *        ↓
 * baj_profiles.id
 *
 * baj_announcements.created_by references
 * baj_profiles.id.
 */
async function ensureAdminProfileExists(
    userId
) {
    const result = await query(
        `
            SELECT
                pr.id,
                pr.user_id,
                pr.member_id,
                pr.full_name,
                pr.role,
                pr.status
            FROM baj_profiles pr
            WHERE pr.user_id = $1
            LIMIT 1
        `,
        [userId]
    );

    if (
        result.rows.length === 0
    ) {
        throw new Error(
            "The authenticated administrator profile could not be found."
        );
    }

    const profile =
        result.rows[0];

    if (
        profile.role !== "ADMIN" &&
        profile.role !== "SUPER_ADMIN"
    ) {
        throw new Error(
            "Only administrators can manage announcements."
        );
    }

    if (
        profile.status !== "ACTIVE"
    ) {
        throw new Error(
            "The administrator account is not active."
        );
    }

    return profile;
}

export async function listAnnouncements({
    search = "",
    status = "",
    category = "",
    page = 1,
    limit = 20
} = {}) {
    const pagination =
        normalizePagination(
            page,
            limit
        );

    const conditions = [];
    const values = [];

    if (search.trim()) {
        values.push(
            `%${search.trim()}%`
        );

        conditions.push(`
            (
                a.title ILIKE $${values.length}
                OR a.content ILIKE $${values.length}
            )
        `);
    }

    if (status) {
        validateStatus(status);

        values.push(status);

        conditions.push(
            `a.status = $${values.length}`
        );
    }

    if (category) {
        validateCategory(category);

        values.push(category);

        conditions.push(
            `a.category = $${values.length}`
        );
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const countResult =
        await query(
            `
                SELECT
                    COUNT(*)::integer AS total
                FROM baj_announcements a
                ${whereClause}
            `,
            values
        );

    const total =
        countResult.rows[0]?.total ||
        0;

    values.push(
        pagination.limit
    );

    const limitPosition =
        values.length;

    values.push(
        pagination.offset
    );

    const offsetPosition =
        values.length;

    const result = await query(
        `
            SELECT
                a.id,
                a.title,
                a.content,
                a.category,
                a.status,
                a.published_at,
                a.created_by,
                a.created_at,
                a.updated_at,
                pr.full_name AS creator_name,
                pr.member_id AS creator_member_id
            FROM baj_announcements a
            INNER JOIN baj_profiles pr
                ON pr.id = a.created_by
            ${whereClause}
            ORDER BY
                CASE
                    WHEN a.status = 'PUBLISHED'
                        THEN 0
                    WHEN a.status = 'DRAFT'
                        THEN 1
                    ELSE 2
                END,
                COALESCE(
                    a.published_at,
                    a.created_at
                ) DESC
            LIMIT $${limitPosition}
            OFFSET $${offsetPosition}
        `,
        values
    );

    const totalPages =
        total === 0
            ? 0
            : Math.ceil(
                  total /
                      pagination.limit
              );

    return {
        announcements:
            result.rows,
        pagination: {
            page:
                pagination.page,
            limit:
                pagination.limit,
            total,
            totalPages
        }
    };
}

export async function getAnnouncementById(
    announcementId
) {
    const result = await query(
        `
            SELECT
                a.id,
                a.title,
                a.content,
                a.category,
                a.status,
                a.published_at,
                a.created_by,
                a.created_at,
                a.updated_at,
                pr.full_name AS creator_name,
                pr.member_id AS creator_member_id
            FROM baj_announcements a
            INNER JOIN baj_profiles pr
                ON pr.id = a.created_by
            WHERE a.id = $1
            LIMIT 1
        `,
        [announcementId]
    );

    if (
        result.rows.length === 0
    ) {
        throw new Error(
            "Announcement not found."
        );
    }

    return result.rows[0];
}

export async function createAnnouncement({
    title,
    content,
    category = "GENERAL",
    createdByUserId
}) {
    validateTitle(title);
    validateContent(content);
    validateCategory(category);

    if (!createdByUserId) {
        throw new Error(
            "The authenticated administrator is required."
        );
    }

    const adminProfile =
        await ensureAdminProfileExists(
            createdByUserId
        );

    const result = await query(
        `
            INSERT INTO baj_announcements (
                title,
                content,
                category,
                status,
                published_at,
                created_by
            )
            VALUES (
                $1,
                $2,
                $3,
                'DRAFT',
                NULL,
                $4
            )
            RETURNING
                id,
                title,
                content,
                category,
                status,
                published_at,
                created_by,
                created_at,
                updated_at
        `,
        [
            title.trim(),
            content.trim(),
            category,
            adminProfile.id
        ]
    );

    return getAnnouncementById(
        result.rows[0].id
    );
}

export async function updateAnnouncement(
    announcementId,
    {
        title,
        content,
        category
    }
) {
    const existing =
        await getAnnouncementById(
            announcementId
        );

    const updates = [];
    const values = [];

    if (title !== undefined) {
        validateTitle(title);

        values.push(
            title.trim()
        );

        updates.push(
            `title = $${values.length}`
        );
    }

    if (content !== undefined) {
        validateContent(content);

        values.push(
            content.trim()
        );

        updates.push(
            `content = $${values.length}`
        );
    }

    if (
        category !== undefined
    ) {
        validateCategory(
            category
        );

        values.push(category);

        updates.push(
            `category = $${values.length}`
        );
    }

    if (
        updates.length === 0
    ) {
        return existing;
    }

    values.push(
        announcementId
    );

    await query(
        `
            UPDATE baj_announcements
            SET
                ${updates.join(", ")},
                updated_at = NOW()
            WHERE id = $${values.length}
        `,
        values
    );

    return getAnnouncementById(
        announcementId
    );
}

export async function updateAnnouncementStatus(
    announcementId,
    status
) {
    validateStatus(status);

    const existing =
        await getAnnouncementById(
            announcementId
        );

    if (
        existing.status ===
            "ARCHIVED" &&
        status !== "ARCHIVED"
    ) {
        throw new Error(
            "An archived announcement cannot be reopened."
        );
    }

    let publishedAt =
        existing.published_at;

    if (
        status === "PUBLISHED"
    ) {
        publishedAt =
            existing.published_at ||
            new Date().toISOString();
    }

    if (
        status === "DRAFT"
    ) {
        publishedAt = null;
    }

    await query(
        `
            UPDATE baj_announcements
            SET
                status = $1,
                published_at = $2,
                updated_at = NOW()
            WHERE id = $3
        `,
        [
            status,
            publishedAt,
            announcementId
        ]
    );

    return getAnnouncementById(
        announcementId
    );
}

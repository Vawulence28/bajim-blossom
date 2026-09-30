import pool from "../config/database.js";

function normalizePagination(
    page = 1,
    pageSize = 20
) {
    const parsedPage =
        Number.parseInt(page, 10);

    const parsedPageSize =
        Number.parseInt(pageSize, 10);

    const safePage =
        Number.isInteger(parsedPage) &&
        parsedPage > 0
            ? parsedPage
            : 1;

    const safePageSize =
        Number.isInteger(parsedPageSize) &&
        parsedPageSize > 0
            ? Math.min(parsedPageSize, 100)
            : 20;

    return {
        page: safePage,
        pageSize: safePageSize,
        offset:
            (safePage - 1) *
            safePageSize
    };
}

function validateDate(
    value,
    fieldName
) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        const error = new Error(
            `${fieldName} must be a valid date.`
        );

        error.statusCode = 400;

        throw error;
    }

    return value;
}

function buildDateCondition(
    conditions,
    values,
    startDate,
    endDate,
    column = "al.created_at"
) {
    if (startDate) {
        values.push(startDate);

        conditions.push(
            `${column} >= $${values.length}::date`
        );
    }

    if (endDate) {
        values.push(endDate);

        conditions.push(
            `${column} < ($${values.length}::date + INTERVAL '1 day')`
        );
    }
}

/**
 * Resolve the authenticated system user
 * to the corresponding BAJIM profile.
 *
 * req.auth.userId is baj_users.id.
 * Activity logs require baj_profiles.id.
 */
export async function getActivityActorProfile(
    userId
) {
    if (!userId) {
        throw new Error(
            "Authenticated user ID is required."
        );
    }

    const result = await pool.query(
        `
        SELECT
            id,
            member_id,
            full_name,
            phone,
            email,
            role,
            status
        FROM baj_profiles
        WHERE user_id = $1
        LIMIT 1
        `,
        [userId]
    );

    if (!result.rows.length) {
        const error = new Error(
            "Authenticated administrator profile could not be found."
        );

        error.statusCode = 401;

        throw error;
    }

    return result.rows[0];
}

/**
 * Creates an activity log.
 */
export async function createActivityLog({
    actorId,
    action,
    entityType = null,
    entityId = null,
    description,
    metadata = null,
    ipAddress = null,
    userAgent = null
}) {
    if (!actorId) {
        throw new Error(
            "Activity actor is required."
        );
    }

    if (!action) {
        throw new Error(
            "Activity action is required."
        );
    }

    if (!description) {
        throw new Error(
            "Activity description is required."
        );
    }

    const result = await pool.query(
        `
        INSERT INTO baj_activity_logs (
            actor_id,
            action,
            entity_type,
            entity_id,
            description,
            metadata,
            ip_address,
            user_agent
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
        )
        RETURNING
            id,
            actor_id,
            action,
            entity_type,
            entity_id,
            description,
            metadata,
            ip_address,
            user_agent,
            created_at
        `,
        [
            actorId,
            action,
            entityType,
            entityId,
            description,
            metadata,
            ipAddress,
            userAgent
        ]
    );

    return result.rows[0];
}

/**
 * Writes an administrator activity log
 * without allowing logging failures to break
 * the main business operation.
 */
export async function recordAdminActivity({
    userId,
    req,
    action,
    entityType = null,
    entityId = null,
    description,
    metadata = null
}) {
    try {
        const actor =
            await getActivityActorProfile(
                userId
            );

        const ipAddress =
            req?.ip || null;

        const userAgent =
            req?.get?.("user-agent") ||
            null;

        return await createActivityLog({
            actorId: actor.id,
            action,
            entityType,
            entityId,
            description,
            metadata,
            ipAddress,
            userAgent
        });
    } catch (error) {
        console.error(
            "Activity log write failed:",
            error
        );

        return null;
    }
}

export async function getActivityLog(
    id
) {
    if (!id) {
        const error = new Error(
            "Activity log ID is required."
        );

        error.statusCode = 400;

        throw error;
    }

    const result = await pool.query(
        `
        SELECT
            al.id,
            al.actor_id,
            al.action,
            al.entity_type,
            al.entity_id,
            al.description,
            al.metadata,
            al.ip_address,
            al.user_agent,
            al.created_at,

            pr.member_id AS actor_member_id,
            pr.full_name AS actor_name,
            pr.phone AS actor_phone,
            pr.email AS actor_email,
            pr.role AS actor_role

        FROM baj_activity_logs al

        INNER JOIN baj_profiles pr
            ON pr.id = al.actor_id

        WHERE al.id = $1

        LIMIT 1
        `,
        [id]
    );

    if (!result.rows.length) {
        const error = new Error(
            "Activity log not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return result.rows[0];
}

export async function listActivityLogs({
    search = "",
    action = "",
    entityType = "",
    startDate = "",
    endDate = "",
    page = 1,
    pageSize = 20
} = {}) {
    const pagination =
        normalizePagination(
            page,
            pageSize
        );

    const conditions = [];
    const values = [];

    if (search.trim()) {
        values.push(
            `%${search.trim()}%`
        );

        const searchParam =
            `$${values.length}`;

        conditions.push(
            `(
                al.description ILIKE ${searchParam}
                OR al.action ILIKE ${searchParam}
                OR al.entity_type ILIKE ${searchParam}
                OR pr.full_name ILIKE ${searchParam}
                OR pr.member_id ILIKE ${searchParam}
                OR pr.phone ILIKE ${searchParam}
                OR pr.email ILIKE ${searchParam}
            )`
        );
    }

    if (action) {
        values.push(action);

        conditions.push(
            `al.action = $${values.length}`
        );
    }

    if (entityType) {
        values.push(entityType);

        conditions.push(
            `al.entity_type = $${values.length}`
        );
    }

    const validStartDate =
        validateDate(
            startDate,
            "startDate"
        );

    const validEndDate =
        validateDate(
            endDate,
            "endDate"
        );

    if (
        validStartDate &&
        validEndDate &&
        new Date(validStartDate) >
            new Date(validEndDate)
    ) {
        const error = new Error(
            "startDate cannot be after endDate."
        );

        error.statusCode = 400;

        throw error;
    }

    buildDateCondition(
        conditions,
        values,
        validStartDate,
        validEndDate
    );

    const whereClause =
        conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const countResult =
        await pool.query(
            `
            SELECT
                COUNT(*)::int AS total

            FROM baj_activity_logs al

            INNER JOIN baj_profiles pr
                ON pr.id = al.actor_id

            ${whereClause}
            `,
            values
        );

    const total =
        Number(
            countResult.rows[0]?.total || 0
        );

    const dataValues = [
        ...values,
        pagination.pageSize,
        pagination.offset
    ];

    const dataResult =
        await pool.query(
            `
            SELECT
                al.id,
                al.actor_id,
                al.action,
                al.entity_type,
                al.entity_id,
                al.description,
                al.metadata,
                al.ip_address,
                al.user_agent,
                al.created_at,

                pr.member_id AS actor_member_id,
                pr.full_name AS actor_name,
                pr.phone AS actor_phone,
                pr.email AS actor_email,
                pr.role AS actor_role

            FROM baj_activity_logs al

            INNER JOIN baj_profiles pr
                ON pr.id = al.actor_id

            ${whereClause}

            ORDER BY al.created_at DESC

            LIMIT $${dataValues.length - 1}
            OFFSET $${dataValues.length}
            `,
            dataValues
        );

    return {
        rows: dataResult.rows,

        pagination: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total,
            totalPages:
                total === 0
                    ? 0
                    : Math.ceil(
                        total /
                        pagination.pageSize
                    )
        }
    };
}

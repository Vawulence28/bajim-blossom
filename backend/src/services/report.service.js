import { query } from "../config/database.js";

function normalizePagination(
    page = 1,
    limit = 50
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
            : 50;

    return {
        page: safePage,
        limit: safeLimit,
        offset:
            (safePage - 1) *
            safeLimit
    };
}

function validateDate(
    value,
    fieldName
) {
    if (!value) {
        return;
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        throw new Error(
            `${fieldName} is not a valid date.`
        );
    }
}

function validateDateRange(
    startDate,
    endDate
) {
    validateDate(
        startDate,
        "Start date"
    );

    validateDate(
        endDate,
        "End date"
    );

    if (
        startDate &&
        endDate &&
        new Date(startDate) >
            new Date(endDate)
    ) {
        throw new Error(
            "Start date cannot be later than end date."
        );
    }
}

function buildDateCondition(
    column,
    startDate,
    endDate,
    values
) {
    const conditions = [];

    if (startDate) {
        values.push(startDate);

        conditions.push(
            `${column} >= $${values.length}`
        );
    }

    if (endDate) {
        values.push(endDate);

        conditions.push(
            `${column} < ($${values.length}::date + INTERVAL '1 day')`
        );
    }

    return conditions;
}

/*
 * Contribution Report
 *
 * Member:
 *   baj_contributions.member_id
 *       -> baj_profiles.id
 *
 * Cycle:
 *   baj_contributions.cycle_id
 *       -> baj_contribution_cycles.id
 */
export async function getContributionReport({
    search = "",
    status = "",
    cycleId = "",
    startDate = "",
    endDate = "",
    page = 1,
    limit = 50
} = {}) {
    validateDateRange(
        startDate,
        endDate
    );

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
                pr.full_name ILIKE $${values.length}
                OR pr.member_id ILIKE $${values.length}
                OR pr.phone ILIKE $${values.length}
            )
        `);
    }

    if (status) {
        values.push(status);

        conditions.push(
            `c.status = $${values.length}`
        );
    }

    if (cycleId) {
        values.push(cycleId);

        conditions.push(
            `c.cycle_id = $${values.length}`
        );
    }

    const dateConditions =
        buildDateCondition(
            "cc.starts_at",
            startDate,
            endDate,
            values
        );

    conditions.push(
        ...dateConditions
    );

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(
                  " AND "
              )}`
            : "";

    const countResult =
        await query(
            `
                SELECT
                    COUNT(*)::integer AS total
                FROM baj_contributions c
                INNER JOIN baj_profiles pr
                    ON pr.id = c.member_id
                INNER JOIN baj_contribution_cycles cc
                    ON cc.id = c.cycle_id
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
                c.id,
                c.member_id,
                pr.member_id AS member_code,
                pr.full_name,
                pr.phone,

                c.cycle_id,
                cc.cycle_name,
                cc.starts_at,
                cc.due_at,
                cc.grace_until,

                c.expected_amount,
                c.status,
                c.paid_at,
                c.notes,
                c.created_at,
                c.updated_at,

                COALESCE(
                    SUM(
                        CASE
                            WHEN p.payment_status = 'VERIFIED'
                                THEN p.amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_paid,

                GREATEST(
                    c.expected_amount -
                    COALESCE(
                        SUM(
                            CASE
                                WHEN p.payment_status = 'VERIFIED'
                                    THEN p.amount
                                ELSE 0
                            END
                        ),
                        0
                    ),
                    0
                ) AS outstanding_amount

            FROM baj_contributions c

            INNER JOIN baj_profiles pr
                ON pr.id = c.member_id

            INNER JOIN baj_contribution_cycles cc
                ON cc.id = c.cycle_id

            LEFT JOIN baj_payments p
                ON p.contribution_id = c.id

            ${whereClause}

            GROUP BY
                c.id,
                c.member_id,
                pr.member_id,
                pr.full_name,
                pr.phone,
                c.cycle_id,
                cc.cycle_name,
                cc.starts_at,
                cc.due_at,
                cc.grace_until,
                c.expected_amount,
                c.status,
                c.paid_at,
                c.notes,
                c.created_at,
                c.updated_at

            ORDER BY
                cc.starts_at DESC,
                pr.full_name ASC

            LIMIT $${limitPosition}
            OFFSET $${offsetPosition}
        `,
        values
    );

    return {
        rows: result.rows,
        pagination: {
            page:
                pagination.page,
            limit:
                pagination.limit,
            total,
            totalPages:
                total === 0
                    ? 0
                    : Math.ceil(
                          total /
                              pagination.limit
                      )
        }
    };
}

/*
 * Payment Report
 */
export async function getPaymentReport({
    search = "",
    paymentStatus = "",
    paymentMethod = "",
    startDate = "",
    endDate = "",
    page = 1,
    limit = 50
} = {}) {
    validateDateRange(
        startDate,
        endDate
    );

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
                pr.full_name ILIKE $${values.length}
                OR pr.member_id ILIKE $${values.length}
                OR pr.phone ILIKE $${values.length}
                OR p.payment_reference ILIKE $${values.length}
            )
        `);
    }

    if (paymentStatus) {
        values.push(
            paymentStatus
        );

        conditions.push(
            `p.payment_status = $${values.length}`
        );
    }

    if (paymentMethod) {
        values.push(
            paymentMethod
        );

        conditions.push(
            `p.payment_method = $${values.length}`
        );
    }

    const dateConditions =
        buildDateCondition(
            "p.paid_at",
            startDate,
            endDate,
            values
        );

    conditions.push(
        ...dateConditions
    );

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(
                  " AND "
              )}`
            : "";

    const countResult =
        await query(
            `
                SELECT
                    COUNT(*)::integer AS total
                FROM baj_payments p
                INNER JOIN baj_contributions c
                    ON c.id = p.contribution_id
                INNER JOIN baj_profiles pr
                    ON pr.id = c.member_id
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
                p.id,
                p.contribution_id,

                pr.id AS profile_id,
                pr.member_id AS member_code,
                pr.full_name,
                pr.phone,

                c.cycle_id,
                cc.cycle_name,

                p.amount,
                p.payment_method,
                p.payment_status,
                p.payment_reference,
                p.paid_at,

                recorder.full_name
                    AS recorded_by_name,

                p.notes,
                p.created_at,
                p.updated_at

            FROM baj_payments p

            INNER JOIN baj_contributions c
                ON c.id = p.contribution_id

            INNER JOIN baj_profiles pr
                ON pr.id = c.member_id

            INNER JOIN baj_contribution_cycles cc
                ON cc.id = c.cycle_id

            LEFT JOIN baj_profiles recorder
                ON recorder.id = p.recorded_by

            ${whereClause}

            ORDER BY
                p.paid_at DESC,
                pr.full_name ASC

            LIMIT $${limitPosition}
            OFFSET $${offsetPosition}
        `,
        values
    );

    return {
        rows: result.rows,
        pagination: {
            page:
                pagination.page,
            limit:
                pagination.limit,
            total,
            totalPages:
                total === 0
                    ? 0
                    : Math.ceil(
                          total /
                              pagination.limit
                      )
        }
    };
}

/*
 * Fine Report
 */
export async function getFineReport({
    search = "",
    status = "",
    startDate = "",
    endDate = "",
    page = 1,
    limit = 50
} = {}) {
    validateDateRange(
        startDate,
        endDate
    );

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
                pr.full_name ILIKE $${values.length}
                OR pr.member_id ILIKE $${values.length}
                OR pr.phone ILIKE $${values.length}
                OR f.reason ILIKE $${values.length}
            )
        `);
    }

    if (status) {
        values.push(status);

        conditions.push(
            `f.status = $${values.length}`
        );
    }

    const dateConditions =
        buildDateCondition(
            "f.applied_at",
            startDate,
            endDate,
            values
        );

    conditions.push(
        ...dateConditions
    );

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(
                  " AND "
              )}`
            : "";

    const countResult =
        await query(
            `
                SELECT
                    COUNT(*)::integer AS total
                FROM baj_fines f
                INNER JOIN baj_contributions c
                    ON c.id = f.contribution_id
                INNER JOIN baj_profiles pr
                    ON pr.id = c.member_id
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
                f.id,
                f.contribution_id,

                pr.id AS profile_id,
                pr.member_id AS member_code,
                pr.full_name,
                pr.phone,

                c.cycle_id,
                cc.cycle_name,

                f.amount,
                f.reason,
                f.status,
                f.applied_at,
                f.paid_at,
                f.notes,
                f.created_at,
                f.updated_at

            FROM baj_fines f

            INNER JOIN baj_contributions c
                ON c.id = f.contribution_id

            INNER JOIN baj_profiles pr
                ON pr.id = c.member_id

            INNER JOIN baj_contribution_cycles cc
                ON cc.id = c.cycle_id

            ${whereClause}

            ORDER BY
                f.applied_at DESC,
                pr.full_name ASC

            LIMIT $${limitPosition}
            OFFSET $${offsetPosition}
        `,
        values
    );

    return {
        rows: result.rows,
        pagination: {
            page:
                pagination.page,
            limit:
                pagination.limit,
            total,
            totalPages:
                total === 0
                    ? 0
                    : Math.ceil(
                          total /
                              pagination.limit
                      )
        }
    };
}

/*
 * Members available for member statements.
 *
 * This returns baj_profiles.id because
 * contributions.member_id references
 * baj_profiles.id.
 */
export async function listReportMembers({
    search = "",
    status = "ACTIVE"
} = {}) {
    const conditions = [];
    const values = [];

    if (search.trim()) {
        values.push(
            `%${search.trim()}%`
        );

        conditions.push(`
            (
                pr.full_name ILIKE $${values.length}
                OR pr.member_id ILIKE $${values.length}
                OR pr.phone ILIKE $${values.length}
            )
        `);
    }

    if (status) {
        values.push(status);

        conditions.push(
            `pr.status = $${values.length}`
        );
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(
                  " AND "
              )}`
            : "";

    const result = await query(
        `
            SELECT
                pr.id,
                pr.member_id,
                pr.full_name,
                pr.phone,
                pr.email,
                pr.status
            FROM baj_profiles pr
            ${whereClause}
            ORDER BY
                pr.full_name ASC
        `,
        values
    );

    return result.rows;
}

/*
 * Individual Member Statement
 */
export async function getMemberStatement(
    memberProfileId,
    {
        startDate = "",
        endDate = ""
    } = {}
) {
    validateDateRange(
        startDate,
        endDate
    );

    const memberResult =
        await query(
            `
                SELECT
                    id,
                    member_id,
                    full_name,
                    phone,
                    email,
                    address,
                    status,
                    joined_at
                FROM baj_profiles
                WHERE id = $1
                LIMIT 1
            `,
            [memberProfileId]
        );

    if (
        memberResult.rows.length === 0
    ) {
        throw new Error(
            "Member not found."
        );
    }

    const member =
        memberResult.rows[0];

    const contributionValues = [
        memberProfileId
    ];

    const contributionConditions = [
        "c.member_id = $1"
    ];

    const contributionDateConditions =
        buildDateCondition(
            "cc.starts_at",
            startDate,
            endDate,
            contributionValues
        );

    contributionConditions.push(
        ...contributionDateConditions
    );

    const contributionResult =
        await query(
            `
                SELECT
                    c.id,
                    c.cycle_id,
                    cc.cycle_name,
                    cc.starts_at,
                    cc.due_at,
                    cc.grace_until,
                    c.expected_amount,
                    c.status,
                    c.paid_at,
                    c.notes,

                    COALESCE(
                        (
                            SELECT
                                SUM(p.amount)
                            FROM baj_payments p
                            WHERE
                                p.contribution_id = c.id
                                AND p.payment_status = 'VERIFIED'
                        ),
                        0
                    ) AS total_paid,

                    GREATEST(
                        c.expected_amount -
                        COALESCE(
                            (
                                SELECT
                                    SUM(p.amount)
                                FROM baj_payments p
                                WHERE
                                    p.contribution_id = c.id
                                    AND p.payment_status = 'VERIFIED'
                            ),
                            0
                        ),
                        0
                    ) AS outstanding_amount

                FROM baj_contributions c

                INNER JOIN baj_contribution_cycles cc
                    ON cc.id = c.cycle_id

                WHERE ${contributionConditions.join(
                    " AND "
                )}

                ORDER BY
                    cc.starts_at DESC
            `,
            contributionValues
        );

    const paymentResult =
        await query(
            `
                SELECT
                    p.id,
                    p.contribution_id,
                    cc.cycle_name,
                    p.amount,
                    p.payment_method,
                    p.payment_status,
                    p.payment_reference,
                    p.paid_at,
                    p.notes

                FROM baj_payments p

                INNER JOIN baj_contributions c
                    ON c.id = p.contribution_id

                INNER JOIN baj_contribution_cycles cc
                    ON cc.id = c.cycle_id

                WHERE
                    c.member_id = $1

                    ${
                        startDate
                            ? `AND p.paid_at >= $2`
                            : ""
                    }

                    ${
                        endDate
                            ? `AND p.paid_at < ($${
                                  startDate
                                      ? 3
                                      : 2
                              }::date + INTERVAL '1 day')`
                            : ""
                    }

                ORDER BY
                    p.paid_at DESC
            `,
            [
                memberProfileId,
                ...(startDate
                    ? [startDate]
                    : []),
                ...(endDate
                    ? [endDate]
                    : [])
            ]
        );

    const fineValues = [
        memberProfileId
    ];

    const fineConditions = [
        "c.member_id = $1"
    ];

    const fineDateConditions =
        buildDateCondition(
            "f.applied_at",
            startDate,
            endDate,
            fineValues
        );

    fineConditions.push(
        ...fineDateConditions
    );

    const fineResult =
        await query(
            `
                SELECT
                    f.id,
                    f.contribution_id,
                    cc.cycle_name,
                    f.amount,
                    f.reason,
                    f.status,
                    f.applied_at,
                    f.paid_at,
                    f.notes

                FROM baj_fines f

                INNER JOIN baj_contributions c
                    ON c.id = f.contribution_id

                INNER JOIN baj_contribution_cycles cc
                    ON cc.id = c.cycle_id

                WHERE ${fineConditions.join(
                    " AND "
                )}

                ORDER BY
                    f.applied_at DESC
            `,
            fineValues
        );

    const summaryResult =
        await query(
            `
                SELECT
                    COALESCE(
                        SUM(
                            c.expected_amount
                        ),
                        0
                    ) AS total_expected,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN p.payment_status = 'VERIFIED'
                                    THEN p.amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_paid

                FROM baj_contributions c

                INNER JOIN baj_contribution_cycles cc
                    ON cc.id = c.cycle_id

                LEFT JOIN baj_payments p
                    ON p.contribution_id = c.id

                WHERE
                    c.member_id = $1

                    ${
                        startDate
                            ? `AND cc.starts_at >= $2`
                            : ""
                    }

                    ${
                        endDate
                            ? `AND cc.starts_at < ($${
                                  startDate
                                      ? 3
                                      : 2
                              }::date + INTERVAL '1 day')`
                            : ""
                    }
            `,
            [
                memberProfileId,
                ...(startDate
                    ? [startDate]
                    : []),
                ...(endDate
                    ? [endDate]
                    : [])
            ]
        );

    const summary =
        summaryResult.rows[0] || {};

    const totalExpected =
        Number(
            summary.total_expected || 0
        );

    const totalPaid =
        Number(
            summary.total_paid || 0
        );

    const totalFines =
        fineResult.rows.reduce(
            (total, fine) =>
                total +
                Number(
                    fine.amount || 0
                ),
            0
        );

    const outstandingContribution =
        Math.max(
            totalExpected -
                totalPaid,
            0
        );

    const outstandingFines =
        fineResult.rows.reduce(
            (total, fine) =>
                fine.status ===
                "OUTSTANDING"
                    ? total +
                      Number(
                          fine.amount || 0
                      )
                    : total,
            0
        );

    return {
        member,
        summary: {
            totalExpected,
            totalPaid,
            outstandingContribution,
            totalFines,
            outstandingFines,
            totalOutstanding:
                outstandingContribution +
                outstandingFines
        },
        contributions:
            contributionResult.rows,
        payments:
            paymentResult.rows,
        fines:
            fineResult.rows
    };
}

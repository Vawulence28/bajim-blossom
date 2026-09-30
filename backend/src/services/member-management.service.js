import { query } from "../config/database.js";

const MEMBER_ID_PREFIX = "BBKHIT";
const MEMBER_ID_DIGITS = 4;

function normalizeSearch(value) {
    if (!value) {
        return "";
    }

    return String(value).trim();
}

function buildMemberId(number) {
    return `${MEMBER_ID_PREFIX}${String(number).padStart(
        MEMBER_ID_DIGITS,
        "0"
    )}`;
}

/**
 * Generate the next BBKHIT member ID.
 *
 * Existing IDs outside the BBKHIT format are preserved.
 * The advisory transaction lock prevents two administrators
 * from generating the same ID at the same time.
 */
async function getNextMemberId() {
    const result = await query(`
        WITH member_lock AS (
            SELECT pg_advisory_xact_lock(
                hashtext('bajim_bbhkit_member_id_generation')
            )
        )
        SELECT COALESCE(
            MAX(
                CAST(
                    SUBSTRING(
                        member_id
                        FROM '^BBKHIT([0-9]+)$'
                    ) AS INTEGER
                )
            ),
            0
        ) AS last_number
        FROM baj_profiles, member_lock
        WHERE member_id ~ '^BBKHIT[0-9]+$'
    `);

    const lastNumber = Number(
        result.rows[0]?.last_number || 0
    );

    return buildMemberId(lastNumber + 1);
}

export async function listMembers({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const normalizedSearch =
        normalizeSearch(search);

    const safePage = Math.max(
        Number.parseInt(page, 10) || 1,
        1
    );

    const safeLimit = Math.min(
        Math.max(
            Number.parseInt(limit, 10) || 20,
            1
        ),
        100
    );

    const offset =
        (safePage - 1) * safeLimit;

    const filters = [
        "p.role = 'MEMBER'"
    ];

    const values = [];

    let parameterIndex = 1;

    if (normalizedSearch) {
        filters.push(`
            (
                p.full_name ILIKE $${parameterIndex}
                OR p.member_id ILIKE $${parameterIndex}
                OR p.phone ILIKE $${parameterIndex}
                OR p.email ILIKE $${parameterIndex}
            )
        `);

        values.push(
            `%${normalizedSearch}%`
        );

        parameterIndex += 1;
    }

    if (status) {
        filters.push(
            `p.status = $${parameterIndex}`
        );

        values.push(status);

        parameterIndex += 1;
    }

    const whereClause =
        filters.join(" AND ");

    const countResult = await query(
        `
            SELECT COUNT(*)::INTEGER AS total
            FROM baj_profiles p
            WHERE ${whereClause}
        `,
        values
    );

    const total =
        countResult.rows[0]?.total || 0;

    const dataValues = [
        ...values,
        safeLimit,
        offset
    ];

    const membersResult = await query(
        `
            SELECT
                p.id,
                p.member_id,
                p.full_name,
                p.phone,
                p.email,
                p.address,
                p.emergency_contact,
                p.role,
                p.status,
                p.joined_at,
                p.created_at,
                p.updated_at,

                u.is_active,
                u.last_login_at,

                COALESCE(
                    contribution_summary.total_contributions,
                    0
                )::INTEGER AS total_contributions,

                COALESCE(
                    contribution_summary.paid_contributions,
                    0
                )::INTEGER AS paid_contributions,

                COALESCE(
                    contribution_summary.outstanding_contributions,
                    0
                )::INTEGER AS outstanding_contributions

            FROM baj_profiles p

            INNER JOIN baj_users u
                ON u.id = p.user_id

            LEFT JOIN (
                SELECT
                    c.member_id,

                    COUNT(*)::INTEGER
                        AS total_contributions,

                    COUNT(*) FILTER (
                        WHERE c.status = 'PAID'
                    )::INTEGER
                        AS paid_contributions,

                    COUNT(*) FILTER (
                        WHERE c.status IN (
                            'PENDING',
                            'PARTIALLY_PAID',
                            'OVERDUE',
                            'FINE_APPLIED'
                        )
                    )::INTEGER
                        AS outstanding_contributions

                FROM baj_contributions c

                GROUP BY c.member_id
            ) contribution_summary
                ON contribution_summary.member_id = p.id

            WHERE ${whereClause}

            ORDER BY
                CASE
                    WHEN p.status = 'PENDING_APPROVAL'
                    THEN 0

                    WHEN p.status = 'ACTIVE'
                    THEN 1

                    WHEN p.status = 'SUSPENDED'
                    THEN 2

                    ELSE 3
                END,

                p.created_at DESC

            LIMIT $${parameterIndex}
            OFFSET $${parameterIndex + 1}
        `,
        dataValues
    );

    return {
        members: membersResult.rows,

        pagination: {
            page: safePage,
            limit: safeLimit,
            total,

            totalPages:
                total === 0
                    ? 0
                    : Math.ceil(
                          total / safeLimit
                      ),

            hasNextPage:
                safePage * safeLimit <
                total,

            hasPreviousPage:
                safePage > 1
        }
    };
}

export async function getMemberById(
    memberProfileId
) {
    const result = await query(
        `
            SELECT
                p.id,
                p.user_id,
                p.member_id,
                p.full_name,
                p.phone,
                p.email,
                p.address,
                p.emergency_contact,
                p.role,
                p.status,
                p.joined_at,
                p.created_at,
                p.updated_at,

                u.is_active,
                u.last_login_at,

                COALESCE(
                    contribution_summary.total_contributions,
                    0
                )::INTEGER AS total_contributions,

                COALESCE(
                    contribution_summary.paid_contributions,
                    0
                )::INTEGER AS paid_contributions,

                COALESCE(
                    contribution_summary.outstanding_contributions,
                    0
                )::INTEGER AS outstanding_contributions,

                COALESCE(
                    contribution_summary.expected_amount,
                    0
                )::NUMERIC AS expected_amount,

                COALESCE(
                    contribution_summary.verified_paid_amount,
                    0
                )::NUMERIC AS verified_paid_amount,

                COALESCE(
                    fine_summary.total_fines,
                    0
                )::INTEGER AS total_fines,

                COALESCE(
                    fine_summary.outstanding_fines,
                    0
                )::NUMERIC AS outstanding_fines

            FROM baj_profiles p

            INNER JOIN baj_users u
                ON u.id = p.user_id

            LEFT JOIN (
                SELECT
                    c.member_id,

                    COUNT(*)::INTEGER
                        AS total_contributions,

                    COUNT(*) FILTER (
                        WHERE c.status = 'PAID'
                    )::INTEGER
                        AS paid_contributions,

                    COUNT(*) FILTER (
                        WHERE c.status IN (
                            'PENDING',
                            'PARTIALLY_PAID',
                            'OVERDUE',
                            'FINE_APPLIED'
                        )
                    )::INTEGER
                        AS outstanding_contributions,

                    COALESCE(
                        SUM(c.expected_amount),
                        0
                    ) AS expected_amount,

                    COALESCE(
                        SUM(
                            COALESCE(
                                pay.paid_amount,
                                0
                            )
                        ),
                        0
                    ) AS verified_paid_amount

                FROM baj_contributions c

                LEFT JOIN (
                    SELECT
                        contribution_id,
                        SUM(amount) AS paid_amount

                    FROM baj_payments

                    WHERE payment_status =
                        'VERIFIED'

                    GROUP BY contribution_id
                ) pay
                    ON pay.contribution_id =
                        c.id

                GROUP BY c.member_id

            ) contribution_summary
                ON contribution_summary.member_id =
                    p.id

            LEFT JOIN (
                SELECT
                    c.member_id,

                    COUNT(f.id)::INTEGER
                        AS total_fines,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN f.status =
                                    'OUTSTANDING'
                                THEN f.amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS outstanding_fines

                FROM baj_fines f

                INNER JOIN baj_contributions c
                    ON c.id =
                        f.contribution_id

                GROUP BY c.member_id

            ) fine_summary
                ON fine_summary.member_id =
                    p.id

            WHERE
                p.id = $1
                AND p.role = 'MEMBER'

            LIMIT 1
        `,
        [memberProfileId]
    );

    return result.rows[0] || null;
}

/**
 * Change member status.
 *
 * ACTIVE:
 * - user account becomes active
 * - member receives BBKHIT ID if they do not already have one
 *
 * SUSPENDED / INACTIVE / PENDING_APPROVAL:
 * - login account is disabled
 *
 * ADMIN and SUPER_ADMIN profiles cannot be changed
 * through this member-management service.
 */
export async function updateMemberStatus(
    memberProfileId,
    newStatus
) {
    const allowedStatuses = [
        "ACTIVE",
        "INACTIVE",
        "PENDING_APPROVAL",
        "REJECTED"
    ];

    if (!allowedStatuses.includes(newStatus)) {
        throw new Error(
            "Invalid member status."
        );
    }

    const existing = await query(
        `
            SELECT
                p.id,
                p.user_id,
                p.member_id,
                p.full_name,
                p.status,
                p.role
            FROM baj_profiles p
            WHERE
                p.id = $1::UUID
                AND p.role = 'MEMBER'
            LIMIT 1
        `,
        [memberProfileId]
    );

    const member = existing.rows[0];

    if (!member) {
        const error = new Error(
            "Member not found."
        );

        error.statusCode = 404;

        throw error;
    }

    let memberId = member.member_id;

    if (
        newStatus === "ACTIVE" &&
        !memberId
    ) {
        memberId = await getNextMemberId();
    }

    const isUserActive =
        newStatus === "ACTIVE";

    const result = await query(
        `
            WITH updated_profile AS (
                UPDATE baj_profiles
                SET
                    status = $1::VARCHAR,

                    member_id = COALESCE(
                        member_id,
                        $2::VARCHAR
                    ),

                    joined_at = CASE
                        WHEN $1::VARCHAR = 'ACTIVE'
                             AND joined_at IS NULL
                        THEN NOW()
                        ELSE joined_at
                    END,

                    updated_at = NOW()

                WHERE
                    id = $3::UUID
                    AND role = 'MEMBER'

                RETURNING
                    id,
                    user_id,
                    member_id,
                    full_name,
                    phone,
                    email,
                    status,
                    joined_at,
                    updated_at
            ),

            updated_user AS (
                UPDATE baj_users u
                SET
                    is_active = $4::BOOLEAN,
                    updated_at = NOW()

                FROM updated_profile p

                WHERE
                    u.id = p.user_id

                RETURNING
                    u.id,
                    u.is_active
            )

            SELECT
                p.id,
                p.user_id,
                p.member_id,
                p.full_name,
                p.phone,
                p.email,
                p.status,
                p.joined_at,
                p.updated_at,
                u.is_active
            FROM updated_profile p

            INNER JOIN updated_user u
                ON u.id = p.user_id
        `,
        [
            newStatus,
            memberId,
            memberProfileId,
            isUserActive
        ]
    );

    return result.rows[0] || null;
}
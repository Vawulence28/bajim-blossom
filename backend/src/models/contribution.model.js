import { query } from "../config/database.js";

export async function findMemberProfileIdByUserId(userId) {
    const result = await query(
        `
        SELECT
            id
        FROM baj_profiles
        WHERE user_id = $1
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0]?.id || null;
}

export async function findMemberContributionSummary(memberProfileId) {
    const result = await query(
        `
        SELECT
            COUNT(c.id)::INTEGER AS total_contributions,

            COUNT(c.id) FILTER (
                WHERE c.status = 'PAID'
            )::INTEGER AS paid_contributions,

            COUNT(c.id) FILTER (
                WHERE c.status IN (
                    'PENDING',
                    'PARTIALLY_PAID',
                    'OVERDUE',
                    'FINE_APPLIED'
                )
            )::INTEGER AS outstanding_contributions,

            COALESCE(
                SUM(c.expected_amount),
                0
            )::NUMERIC(12, 2) AS total_expected_amount,

            COALESCE(
                SUM(
                    COALESCE(
                        (
                            SELECT SUM(p.amount)
                            FROM baj_payments p
                            WHERE p.contribution_id = c.id
                              AND p.payment_status = 'VERIFIED'
                        ),
                        0
                    )
                ),
                0
            )::NUMERIC(12, 2) AS total_paid_amount,

            COALESCE(
                SUM(
                    COALESCE(
                        (
                            SELECT SUM(f.amount)
                            FROM baj_fines f
                            WHERE f.contribution_id = c.id
                              AND f.status = 'OUTSTANDING'
                        ),
                        0
                    )
                ),
                0
            )::NUMERIC(12, 2) AS outstanding_fines

        FROM baj_contributions c
        WHERE c.member_id = $1
        `,
        [memberProfileId]
    );

    return result.rows[0];
}

export async function findCurrentMemberContribution(memberProfileId) {
    const result = await query(
        `
        SELECT
            c.id,
            c.cycle_id,
            c.expected_amount,
            c.status,
            c.paid_at,
            c.notes,

            cycle.cycle_name,
            cycle.starts_at,
            cycle.due_at,
            cycle.grace_until,
            cycle.contribution_amount,
            cycle.fine_amount,
            cycle.status AS cycle_status,

            COALESCE(
                (
                    SELECT SUM(p.amount)
                    FROM baj_payments p
                    WHERE p.contribution_id = c.id
                      AND p.payment_status = 'VERIFIED'
                ),
                0
            )::NUMERIC(12, 2) AS amount_paid,

            COALESCE(
                (
                    SELECT SUM(f.amount)
                    FROM baj_fines f
                    WHERE f.contribution_id = c.id
                      AND f.status = 'OUTSTANDING'
                ),
                0
            )::NUMERIC(12, 2) AS outstanding_fine

        FROM baj_contributions c

        INNER JOIN baj_contribution_cycles cycle
            ON cycle.id = c.cycle_id

        WHERE c.member_id = $1

        ORDER BY
            cycle.starts_at DESC,
            c.created_at DESC

        LIMIT 1
        `,
        [memberProfileId]
    );

    return result.rows[0] || null;
}

export async function findMemberContributionHistory(memberProfileId) {
    const result = await query(
        `
        SELECT
            c.id,
            c.cycle_id,
            c.expected_amount,
            c.status,
            c.paid_at,
            c.notes,
            c.created_at,

            cycle.cycle_name,
            cycle.starts_at,
            cycle.due_at,
            cycle.grace_until,
            cycle.contribution_amount,
            cycle.fine_amount,
            cycle.status AS cycle_status,

            COALESCE(
                (
                    SELECT SUM(p.amount)
                    FROM baj_payments p
                    WHERE p.contribution_id = c.id
                      AND p.payment_status = 'VERIFIED'
                ),
                0
            )::NUMERIC(12, 2) AS amount_paid,

            COALESCE(
                (
                    SELECT SUM(f.amount)
                    FROM baj_fines f
                    WHERE f.contribution_id = c.id
                      AND f.status = 'OUTSTANDING'
                ),
                0
            )::NUMERIC(12, 2) AS outstanding_fine,

            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', p.id,
                            'amount', p.amount,
                            'paymentMethod', p.payment_method,
                            'paymentStatus', p.payment_status,
                            'paymentReference', p.payment_reference,
                            'paidAt', p.paid_at
                        )
                        ORDER BY p.paid_at DESC
                    )
                    FROM baj_payments p
                    WHERE p.contribution_id = c.id
                ),
                '[]'::json
            ) AS payments,

            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', f.id,
                            'amount', f.amount,
                            'reason', f.reason,
                            'status', f.status,
                            'appliedAt', f.applied_at,
                            'paidAt', f.paid_at
                        )
                        ORDER BY f.applied_at DESC
                    )
                    FROM baj_fines f
                    WHERE f.contribution_id = c.id
                ),
                '[]'::json
            ) AS fines

        FROM baj_contributions c

        INNER JOIN baj_contribution_cycles cycle
            ON cycle.id = c.cycle_id

        WHERE c.member_id = $1

        ORDER BY
            cycle.starts_at DESC,
            c.created_at DESC
        `,
        [memberProfileId]
    );

    return result.rows;
}
import { query } from "../config/database.js";

export async function findMemberDashboardData(userId) {
    const result = await query(
        `
        SELECT
            p.id AS profile_id,
            p.member_id,
            p.full_name,
            p.status,
            p.role,

            cycle.id AS cycle_id,
            cycle.cycle_name,
            cycle.starts_at,
            cycle.due_at,
            cycle.grace_until,
            cycle.contribution_amount,
            cycle.fine_amount,
            cycle.status AS cycle_status,

            contribution.id AS contribution_id,
            contribution.expected_amount,
            contribution.status AS contribution_status,
            contribution.paid_at,

            COALESCE(
                (
                    SELECT SUM(payment.amount)
                    FROM baj_payments payment
                    WHERE payment.contribution_id =
                        contribution.id
                      AND payment.payment_status = 'VERIFIED'
                ),
                0
            )::NUMERIC(12, 2) AS amount_paid,

            COALESCE(
                (
                    SELECT SUM(fine.amount)
                    FROM baj_fines fine
                    WHERE fine.contribution_id =
                        contribution.id
                      AND fine.status = 'OUTSTANDING'
                ),
                0
            )::NUMERIC(12, 2) AS outstanding_fine

        FROM baj_profiles p

        LEFT JOIN LATERAL (
            SELECT *
            FROM baj_contribution_cycles
            WHERE status = 'OPEN'
            ORDER BY starts_at DESC
            LIMIT 1
        ) cycle ON TRUE

        LEFT JOIN baj_contributions contribution
            ON contribution.member_id = p.id
            AND contribution.cycle_id = cycle.id

        WHERE p.user_id = $1

        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0] || null;
}

export async function findRecentMemberContributions(
    memberProfileId
) {
    const result = await query(
        `
        SELECT
            c.id,
            c.expected_amount,
            c.status,
            c.paid_at,
            cycle.cycle_name,
            cycle.due_at,

            COALESCE(
                (
                    SELECT SUM(payment.amount)
                    FROM baj_payments payment
                    WHERE payment.contribution_id = c.id
                      AND payment.payment_status = 'VERIFIED'
                ),
                0
            )::NUMERIC(12, 2) AS amount_paid

        FROM baj_contributions c

        INNER JOIN baj_contribution_cycles cycle
            ON cycle.id = c.cycle_id

        WHERE c.member_id = $1

        ORDER BY cycle.starts_at DESC

        LIMIT 5
        `,
        [memberProfileId]
    );

    return result.rows;
}

export async function findLatestPublishedAnnouncement() {
    const result = await query(
        `
        SELECT
            id,
            title,
            content,
            category,
            published_at
        FROM baj_announcements
        WHERE status = 'PUBLISHED'
          AND published_at IS NOT NULL
          AND published_at <= NOW()
        ORDER BY published_at DESC
        LIMIT 1
        `,
        []
    );

    return result.rows[0] || null;
}
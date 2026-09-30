import { query } from "../config/database.js";

export async function findMemberStatusData(userId) {
    const result = await query(
        `
        SELECT
            p.id AS profile_id,
            p.member_id,
            p.full_name,
            p.status AS membership_status,
            p.role,
            p.joined_at,

            current_cycle.id AS current_cycle_id,
            current_cycle.cycle_name,
            current_cycle.starts_at,
            current_cycle.due_at,
            current_cycle.grace_until,
            current_cycle.contribution_amount,
            current_cycle.fine_amount,
            current_cycle.status AS cycle_status,

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
            FROM baj_contribution_cycles cycle
            WHERE cycle.status = 'OPEN'
            ORDER BY cycle.starts_at DESC
            LIMIT 1
        ) current_cycle ON TRUE

        LEFT JOIN baj_contributions contribution
            ON contribution.member_id = p.id
            AND contribution.cycle_id = current_cycle.id

        WHERE p.user_id = $1

        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0] || null;
}

export async function findGroupPaymentStatus(cycleId) {
    if (!cycleId) {
        return null;
    }

    const result = await query(
        `
        SELECT
            COUNT(*)::INTEGER AS total_members,

            COUNT(*) FILTER (
                WHERE c.status = 'PAID'
            )::INTEGER AS paid_members,

            COUNT(*) FILTER (
                WHERE c.status IN (
                    'PENDING',
                    'PARTIALLY_PAID',
                    'OVERDUE',
                    'FINE_APPLIED'
                )
            )::INTEGER AS unpaid_members

        FROM baj_contributions c

        INNER JOIN baj_profiles p
            ON p.id = c.member_id

        WHERE c.cycle_id = $1
          AND p.status = 'ACTIVE'
        `,
        [cycleId]
    );

    return result.rows[0] || null;
}
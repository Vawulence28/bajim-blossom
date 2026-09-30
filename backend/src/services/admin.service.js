import { query } from "../config/database.js";

export async function getAdminDashboardData() {
    const [
        memberStats,
        cycleStats,
        contributionStats,
        fineStats,
        paymentStats,
        recentMembers,
        recentPayments
    ] = await Promise.all([
        // ---------------------------------------------------------
        // MEMBER STATISTICS
        // ---------------------------------------------------------
        query(`
            SELECT
                COUNT(*)::INTEGER AS total,
                COUNT(*) FILTER (
                    WHERE status = 'PENDING_APPROVAL'
                )::INTEGER AS pending,
                COUNT(*) FILTER (
                    WHERE status = 'ACTIVE'
                )::INTEGER AS active,
                COUNT(*) FILTER (
                    WHERE status = 'SUSPENDED'
                )::INTEGER AS suspended,
                COUNT(*) FILTER (
                    WHERE status = 'INACTIVE'
                )::INTEGER AS inactive
            FROM baj_profiles
            WHERE role = 'MEMBER'
        `),

        // ---------------------------------------------------------
        // CONTRIBUTION CYCLE STATISTICS
        // ---------------------------------------------------------
        query(`
            SELECT
                COUNT(*) FILTER (
                    WHERE status = 'OPEN'
                )::INTEGER AS open,
                COUNT(*) FILTER (
                    WHERE status = 'DRAFT'
                )::INTEGER AS draft,
                COUNT(*) FILTER (
                    WHERE status = 'CLOSED'
                )::INTEGER AS closed
            FROM baj_contribution_cycles
        `),

        // ---------------------------------------------------------
        // CONTRIBUTION STATISTICS
        // ---------------------------------------------------------
        query(`
            SELECT
                COUNT(*)::INTEGER AS total,

                COUNT(*) FILTER (
                    WHERE status = 'PAID'
                )::INTEGER AS paid,

                COUNT(*) FILTER (
                    WHERE status IN (
                        'PENDING',
                        'PARTIALLY_PAID',
                        'OVERDUE',
                        'FINE_APPLIED'
                    )
                )::INTEGER AS outstanding,

                COALESCE(
                    SUM(
                        GREATEST(
                            c.expected_amount -
                            COALESCE(
                                verified_payments.paid_amount,
                                0
                            ),
                            0
                        )
                    ) FILTER (
                        WHERE c.status IN (
                            'PENDING',
                            'PARTIALLY_PAID',
                            'OVERDUE',
                            'FINE_APPLIED'
                        )
                    ),
                    0
                )::NUMERIC AS outstanding_amount

            FROM baj_contributions c

            LEFT JOIN (
                SELECT
                    contribution_id,
                    SUM(amount) AS paid_amount
                FROM baj_payments
                WHERE payment_status = 'VERIFIED'
                GROUP BY contribution_id
            ) AS verified_payments
                ON verified_payments.contribution_id = c.id
        `),

        // ---------------------------------------------------------
        // FINE STATISTICS
        // ---------------------------------------------------------
        query(`
            SELECT
                COUNT(*) FILTER (
                    WHERE status = 'OUTSTANDING'
                )::INTEGER AS outstanding_count,

                COALESCE(
                    SUM(amount) FILTER (
                        WHERE status = 'OUTSTANDING'
                    ),
                    0
                )::NUMERIC AS outstanding_amount,

                COUNT(*) FILTER (
                    WHERE status = 'PAID'
                )::INTEGER AS paid_count,

                COALESCE(
                    SUM(amount) FILTER (
                        WHERE status = 'PAID'
                    ),
                    0
                )::NUMERIC AS paid_amount

            FROM baj_fines
        `),

        // ---------------------------------------------------------
        // PAYMENT STATISTICS
        // ---------------------------------------------------------
        query(`
            SELECT
                COUNT(*)::INTEGER AS total,

                COUNT(*) FILTER (
                    WHERE payment_status = 'PENDING'
                )::INTEGER AS pending,

                COUNT(*) FILTER (
                    WHERE payment_status = 'VERIFIED'
                )::INTEGER AS verified,

                COUNT(*) FILTER (
                    WHERE payment_status = 'REJECTED'
                )::INTEGER AS rejected,

                COALESCE(
                    SUM(amount) FILTER (
                        WHERE payment_status = 'VERIFIED'
                    ),
                    0
                )::NUMERIC AS verified_amount

            FROM baj_payments
        `),

        // ---------------------------------------------------------
        // RECENT MEMBERS
        // ---------------------------------------------------------
        query(`
            SELECT
                id,
                member_id,
                full_name,
                phone,
                email,
                role,
                status,
                joined_at,
                created_at
            FROM baj_profiles
            WHERE role = 'MEMBER'
            ORDER BY created_at DESC
            LIMIT 10
        `),

        // ---------------------------------------------------------
        // RECENT PAYMENTS
        // ---------------------------------------------------------
        query(`
            SELECT
                pay.id,
                pay.amount,
                pay.payment_method,
                pay.payment_status,
                pay.payment_reference,
                pay.paid_at,
                pay.created_at,
                p.member_id,
                p.full_name
            FROM baj_payments pay
            INNER JOIN baj_contributions c
                ON c.id = pay.contribution_id
            INNER JOIN baj_profiles p
                ON p.id = c.member_id
            ORDER BY pay.created_at DESC
            LIMIT 10
        `)
    ]);

    return {
        members: memberStats.rows[0] || {
            total: 0,
            pending: 0,
            active: 0,
            suspended: 0,
            inactive: 0
        },

        cycles: cycleStats.rows[0] || {
            open: 0,
            draft: 0,
            closed: 0
        },

        contributions: contributionStats.rows[0] || {
            total: 0,
            paid: 0,
            outstanding: 0,
            outstanding_amount: 0
        },

        fines: fineStats.rows[0] || {
            outstanding_count: 0,
            outstanding_amount: 0,
            paid_count: 0,
            paid_amount: 0
        },

        payments: paymentStats.rows[0] || {
            total: 0,
            pending: 0,
            verified: 0,
            rejected: 0,
            verified_amount: 0
        },

        recentMembers: recentMembers.rows,

        recentPayments: recentPayments.rows
    };
}
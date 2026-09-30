import { query } from "../config/database.js";

/* =========================================================
   HELPERS
========================================================= */

function normalizeSearch(value) {
    if (!value) {
        return "";
    }

    return String(value).trim();
}

function normalizePage(value) {
    const page = Number(value);

    if (!Number.isFinite(page) || page < 1) {
        return 1;
    }

    return Math.floor(page);
}

function normalizeLimit(value) {
    const limit = Number(value);

    if (!Number.isFinite(limit) || limit < 1) {
        return 20;
    }

    return Math.min(Math.floor(limit), 100);
}

/* =========================================================
   CONTRIBUTION STATUS CALCULATION
========================================================= */

function calculateContributionStatus(
    expectedAmount,
    verifiedPaidAmount
) {
    const expected = Number(expectedAmount || 0);
    const paid = Number(verifiedPaidAmount || 0);

    if (paid >= expected) {
        return "PAID";
    }

    if (paid > 0) {
        return "PARTIALLY_PAID";
    }

    return "PENDING";
}

/* =========================================================
   LIST PAYMENTS
========================================================= */

export async function listPayments({
    search = "",
    status = "",
    method = "",
    page = 1,
    limit = 20
} = {}) {
    const normalizedSearch = normalizeSearch(search);
    const normalizedPage = normalizePage(page);
    const normalizedLimit = normalizeLimit(limit);

    const offset =
        (normalizedPage - 1) * normalizedLimit;

    const values = [];
    const conditions = [];

    if (normalizedSearch) {
        values.push(`%${normalizedSearch}%`);

        const searchIndex = values.length;

        conditions.push(`
            (
                p.payment_reference ILIKE $${searchIndex}
                OR pr.full_name ILIKE $${searchIndex}
                OR pr.phone ILIKE $${searchIndex}
                OR pr.email ILIKE $${searchIndex}
                OR pr.member_id ILIKE $${searchIndex}
                OR c.cycle_name ILIKE $${searchIndex}
            )
        `);
    }

    if (status) {
        values.push(status);

        conditions.push(
            `p.payment_status = $${values.length}`
        );
    }

    if (method) {
        values.push(method);

        conditions.push(
            `p.payment_method = $${values.length}`
        );
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countResult = await query(
        `
        SELECT COUNT(*)::INTEGER AS total
        FROM baj_payments p
        INNER JOIN baj_contributions bc
            ON bc.id = p.contribution_id
        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id
        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id
        ${whereClause}
        `,
        values
    );

    const total =
        Number(countResult.rows[0]?.total || 0);

    const dataValues = [
        ...values,
        normalizedLimit,
        offset
    ];

    const limitIndex =
        dataValues.length - 1;

    const offsetIndex =
        dataValues.length;

    const result = await query(
        `
        SELECT
            p.id,
            p.contribution_id,
            p.amount,
            p.payment_method,
            p.payment_status,
            p.payment_reference,
            p.paid_at,
            p.recorded_by,
            p.notes,
            p.created_at,
            p.updated_at,

            pr.user_id AS member_user_id,
            pr.member_id,
            pr.full_name,
            pr.phone,
            pr.email,

            c.id AS cycle_id,
            c.cycle_name,

            bc.expected_amount,
            bc.status AS contribution_status

        FROM baj_payments p

        INNER JOIN baj_contributions bc
            ON bc.id = p.contribution_id

        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id

        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id

        ${whereClause}

        ORDER BY
            p.created_at DESC

        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
        `,
        dataValues
    );

    const totalPages =
        total === 0
            ? 0
            : Math.ceil(
                  total / normalizedLimit
              );

    return {
        payments: result.rows,

        pagination: {
            page: normalizedPage,
            limit: normalizedLimit,
            total,
            totalPages,
            hasNextPage:
                normalizedPage < totalPages,
            hasPreviousPage:
                normalizedPage > 1
        }
    };
}

/* =========================================================
   GET PAYMENT
========================================================= */

export async function getPaymentById(paymentId) {
    const result = await query(
        `
        SELECT
            p.id,
            p.contribution_id,
            p.amount,
            p.payment_method,
            p.payment_status,
            p.payment_reference,
            p.paid_at,
            p.recorded_by,
            p.notes,
            p.created_at,
            p.updated_at,

            pr.user_id AS member_user_id,
            pr.member_id,
            pr.full_name,
            pr.phone,
            pr.email,
            pr.address,

            c.id AS cycle_id,
            c.cycle_name,
            c.starts_at,
            c.due_at,
            c.grace_until,
            c.contribution_amount,
            c.fine_amount,

            bc.expected_amount,
            bc.status AS contribution_status,
            bc.paid_at AS contribution_paid_at

        FROM baj_payments p

        INNER JOIN baj_contributions bc
            ON bc.id = p.contribution_id

        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id

        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id

        WHERE p.id = $1

        LIMIT 1
        `,
        [paymentId]
    );

    return result.rows[0] || null;
}

/* =========================================================
   CONTRIBUTIONS AVAILABLE FOR PAYMENT RECORDING
========================================================= */

export async function listPaymentContributions({
    search = "",
    limit = 50
} = {}) {
    const normalizedSearch =
        normalizeSearch(search);

    const normalizedLimit = Math.min(
        Math.max(
            Number(limit) || 50,
            1
        ),
        100
    );

    const values = [];
    let searchClause = "";

    if (normalizedSearch) {
        values.push(
            `%${normalizedSearch}%`
        );

        searchClause = `
            AND (
                pr.full_name ILIKE $1
                OR pr.member_id ILIKE $1
                OR pr.phone ILIKE $1
                OR pr.email ILIKE $1
                OR c.cycle_name ILIKE $1
            )
        `;
    }

    values.push(normalizedLimit);

    const limitIndex = values.length;

    const result = await query(
        `
        SELECT
            bc.id AS contribution_id,

            pr.user_id AS member_user_id,
            pr.member_id,
            pr.full_name,
            pr.phone,

            c.id AS cycle_id,
            c.cycle_name,
            c.due_at,

            bc.expected_amount,
            bc.status AS contribution_status,

            COALESCE(
                verified.total_paid,
                0
            ) AS verified_paid_amount,

            GREATEST(
                bc.expected_amount -
                COALESCE(
                    verified.total_paid,
                    0
                ),
                0
            ) AS outstanding_amount

        FROM baj_contributions bc

        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id

        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id

        LEFT JOIN (
            SELECT
                contribution_id,
                SUM(amount) AS total_paid

            FROM baj_payments

            WHERE payment_status = 'VERIFIED'

            GROUP BY contribution_id
        ) verified
            ON verified.contribution_id = bc.id

        WHERE
            GREATEST(
                bc.expected_amount -
                COALESCE(
                    verified.total_paid,
                    0
                ),
                0
            ) > 0

            ${searchClause}

        ORDER BY
            c.due_at ASC,
            pr.full_name ASC

        LIMIT $${limitIndex}
        `,
        values
    );

    return result.rows;
}

/* =========================================================
   CREATE PAYMENT
========================================================= */

export async function createPayment({
    contributionId,
    amount,
    paymentMethod,
    paymentReference = null,
    paidAt = null,
    notes = null,
    recordedBy
}) {
    if (!contributionId) {
        throw new Error(
            "Contribution is required."
        );
    }

    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {
        throw new Error(
            "Payment amount must be greater than zero."
        );
    }

    const allowedMethods = [
        "CASH",
        "BANK_TRANSFER"
    ];

    if (
        !allowedMethods.includes(
            paymentMethod
        )
    ) {
        throw new Error(
            "Payment method must be CASH or BANK_TRANSFER."
        );
    }

    /* -----------------------------------------------------
       Find contribution and verified payments
    ----------------------------------------------------- */

    const contributionResult =
        await query(
            `
            SELECT
                bc.id,
                bc.expected_amount,
                bc.status,

                COALESCE(
                    (
                        SELECT SUM(p.amount)
                        FROM baj_payments p
                        WHERE p.contribution_id = bc.id
                          AND p.payment_status = 'VERIFIED'
                    ),
                    0
                ) AS verified_paid_amount

            FROM baj_contributions bc

            WHERE bc.id = $1

            LIMIT 1
            `,
            [contributionId]
        );

    const contribution =
        contributionResult.rows[0];

    if (!contribution) {
        throw new Error(
            "The selected contribution could not be found."
        );
    }

    const expectedAmount =
        Number(
            contribution.expected_amount || 0
        );

    const verifiedPaidAmount =
        Number(
            contribution.verified_paid_amount || 0
        );

    const outstandingAmount =
        Math.max(
            expectedAmount -
                verifiedPaidAmount,
            0
        );

    if (
        numericAmount >
        outstandingAmount
    ) {
        throw new Error(
            `Payment amount cannot exceed the outstanding contribution amount of ₦${outstandingAmount.toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}.`
        );
    }

    /* -----------------------------------------------------
       Resolve authenticated user ID to profile ID.

       req.auth.userId = baj_users.id

       baj_payments.recorded_by =
       baj_profiles.id
    ----------------------------------------------------- */

    let recordedByProfileId = null;

    if (recordedBy) {
        const profileResult =
            await query(
                `
                SELECT id
                FROM baj_profiles
                WHERE user_id = $1
                LIMIT 1
                `,
                [recordedBy]
            );

        recordedByProfileId =
            profileResult.rows[0]?.id ||
            null;
    }

    if (!recordedByProfileId) {
        throw new Error(
            "The administrator profile could not be found."
        );
    }

    /* -----------------------------------------------------
       Insert payment

       Manual payments are immediately VERIFIED
       according to the existing admin workflow.
    ----------------------------------------------------- */

    const result = await query(
        `
        INSERT INTO baj_payments (
            contribution_id,
            amount,
            payment_method,
            payment_status,
            payment_reference,
            paid_at,
            recorded_by,
            notes
        )
        VALUES (
            $1,
            $2,
            $3,
            'VERIFIED',
            $4,
            COALESCE(
                $5::timestamptz,
                NOW()
            ),
            $6,
            $7
        )
        RETURNING
            id,
            contribution_id,
            amount,
            payment_method,
            payment_status,
            payment_reference,
            paid_at,
            recorded_by,
            notes,
            created_at,
            updated_at
        `,
        [
            contributionId,
            numericAmount,
            paymentMethod,
            paymentReference
                ? String(
                      paymentReference
                  ).trim()
                : null,
            paidAt || null,
            recordedByProfileId,
            notes
                ? String(notes).trim()
                : null
        ]
    );

    const payment =
        result.rows[0];

    /* -----------------------------------------------------
       Recalculate contribution status

       PENDING
          ↓
       PARTIALLY_PAID
          ↓
       PAID
    ----------------------------------------------------- */

    const newPaidAmount =
        verifiedPaidAmount +
        numericAmount;

    const newContributionStatus =
        calculateContributionStatus(
            expectedAmount,
            newPaidAmount
        );

    await query(
        `
        UPDATE baj_contributions
        SET
            status = $1::VARCHAR,

            paid_at = CASE
                WHEN $2::BOOLEAN = TRUE
                    THEN COALESCE(
                        paid_at,
                        NOW()
                    )
                ELSE paid_at
            END,

            updated_at = NOW()

        WHERE id = $3
        `,
        [
            newContributionStatus,
            newContributionStatus === "PAID",
            contributionId
        ]
    );

    return payment;
}

/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

export async function updatePaymentStatus(
    paymentId,
    newStatus
) {
    const allowedStatuses = [
        "PENDING",
        "VERIFIED",
        "REJECTED"
    ];

    if (
        !allowedStatuses.includes(
            newStatus
        )
    ) {
        throw new Error(
            "Invalid payment status."
        );
    }

    const existingResult =
        await query(
            `
            SELECT
                id,
                contribution_id,
                amount,
                payment_status

            FROM baj_payments

            WHERE id = $1

            LIMIT 1
            `,
            [paymentId]
        );

    const existing =
        existingResult.rows[0];

    if (!existing) {
        return null;
    }

    if (
        existing.payment_status ===
        newStatus
    ) {
        return existing;
    }

    const result = await query(
        `
        UPDATE baj_payments

        SET
            payment_status = $1,
            updated_at = NOW()

        WHERE id = $2

        RETURNING
            id,
            contribution_id,
            amount,
            payment_method,
            payment_status,
            payment_reference,
            paid_at,
            recorded_by,
            notes,
            created_at,
            updated_at
        `,
        [
            newStatus,
            paymentId
        ]
    );

    /* -----------------------------------------------------
       Recalculate contribution payment state
    ----------------------------------------------------- */

    const summaryResult =
        await query(
            `
            SELECT
                bc.expected_amount,

                COALESCE(
                    (
                        SELECT SUM(p.amount)
                        FROM baj_payments p
                        WHERE p.contribution_id = bc.id
                          AND p.payment_status = 'VERIFIED'
                    ),
                    0
                ) AS verified_paid_amount

            FROM baj_contributions bc

            WHERE bc.id = $1

            LIMIT 1
            `,
            [existing.contribution_id]
        );

    const summary =
        summaryResult.rows[0];

    if (summary) {
        const expectedAmount =
            Number(
                summary.expected_amount || 0
            );

        const verifiedPaid =
            Number(
                summary.verified_paid_amount || 0
            );

        const contributionStatus =
            calculateContributionStatus(
                expectedAmount,
                verifiedPaid
            );

        await query(
            `
            UPDATE baj_contributions

            SET
                status = $1::VARCHAR,

                paid_at = CASE
                    WHEN $2::BOOLEAN = TRUE
                        THEN COALESCE(
                            paid_at,
                            NOW()
                        )
                    ELSE NULL
                END,

                updated_at = NOW()

            WHERE id = $3
            `,
            [
                contributionStatus,
                contributionStatus === "PAID",
                existing.contribution_id
            ]
        );
    }

    return result.rows[0];
}

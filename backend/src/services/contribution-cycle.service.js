import { query } from "../config/database.js";

const ALLOWED_STATUSES = [
    "DRAFT",
    "OPEN",
    "CLOSED"
];

function normalizeStatus(status) {
    if (!status) {
        return "";
    }

    return String(status)
        .trim()
        .toUpperCase();
}

function normalizeSearch(value) {
    if (!value) {
        return "";
    }

    return String(value).trim();
}

function parsePositiveOrZeroNumber(value, fieldName) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        throw new Error(
            `${fieldName} must be a valid number.`
        );
    }

    if (number < 0) {
        throw new Error(
            `${fieldName} cannot be negative.`
        );
    }

    return number;
}

function parseDate(value, fieldName) {
    if (!value) {
        throw new Error(
            `${fieldName} is required.`
        );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(
            `${fieldName} must be a valid date and time.`
        );
    }

    return date;
}

function validateCycleDates({
    startsAt,
    dueAt,
    graceUntil
}) {
    if (startsAt && dueAt) {
        if (startsAt > dueAt) {
            throw new Error(
                "The start date cannot be after the due date."
            );
        }
    }

    if (dueAt && graceUntil) {
        if (graceUntil < dueAt) {
            throw new Error(
                "The grace deadline cannot be before the due date."
            );
        }
    }
}

function mapCycle(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        cycle_name: row.cycle_name,
        starts_at: row.starts_at,
        due_at: row.due_at,
        grace_until: row.grace_until,
        contribution_amount: Number(
            row.contribution_amount || 0
        ),
        fine_amount: Number(
            row.fine_amount || 0
        ),
        status: row.status,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at
    };
}

/**
 * Ensures that every active member has a contribution
 * record for the specified cycle.
 *
 * Existing contribution records are preserved.
 * This function only creates missing records.
 */
async function ensureCycleContributions(
    cycleId,
    contributionAmount
) {
    if (!cycleId) {
        throw new Error(
            "Contribution cycle ID is required."
        );
    }

    const amount = Number(contributionAmount);

    if (!Number.isFinite(amount) || amount < 0) {
        throw new Error(
            "Contribution amount must be a valid non-negative number."
        );
    }

    const result = await query(
        `
        INSERT INTO baj_contributions (
            member_id,
            cycle_id,
            expected_amount,
            status
        )
        SELECT
            p.id,
            $1,
            $2,
            'PENDING'
        FROM baj_profiles p
        WHERE p.status = 'ACTIVE'
        AND NOT EXISTS (
            SELECT 1
            FROM baj_contributions existing
            WHERE existing.member_id = p.id
                AND existing.cycle_id = $1
        )
        RETURNING id
        `,
        [
            cycleId,
            amount
        ]
    );

    return result.rowCount || 0;
}

export async function listContributionCycles({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const normalizedSearch =
        normalizeSearch(search);

    const normalizedStatus =
        normalizeStatus(status);

    const safePage =
        Math.max(
            Number.parseInt(page, 10) || 1,
            1
        );

    const safeLimit =
        Math.min(
            Math.max(
                Number.parseInt(limit, 10) || 20,
                1
            ),
            100
        );

    const offset =
        (safePage - 1) * safeLimit;

    const whereConditions = [];
    const values = [];

    if (normalizedSearch) {
        values.push(
            `%${normalizedSearch}%`
        );

        whereConditions.push(
            `
            (
                cycle_name ILIKE $${values.length}
                OR COALESCE(notes, '') ILIKE $${values.length}
            )
            `
        );
    }

    if (normalizedStatus) {
        if (
            !ALLOWED_STATUSES.includes(
                normalizedStatus
            )
        ) {
            throw new Error(
                "Invalid contribution cycle status."
            );
        }

        values.push(normalizedStatus);

        whereConditions.push(
            `status = $${values.length}`
        );
    }

    const whereClause =
        whereConditions.length
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const countResult = await query(
        `
        SELECT COUNT(*)::INTEGER AS total
        FROM baj_contribution_cycles
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
        safeLimit,
        offset
    ];

    const result = await query(
        `
        SELECT
            id,
            cycle_name,
            starts_at,
            due_at,
            grace_until,
            contribution_amount,
            fine_amount,
            status,
            notes,
            created_at,
            updated_at
        FROM baj_contribution_cycles
        ${whereClause}
        ORDER BY starts_at DESC, created_at DESC
        LIMIT $${dataValues.length - 1}
        OFFSET $${dataValues.length}
        `,
        dataValues
    );

    return {
        cycles: result.rows.map(mapCycle),
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages:
                Math.ceil(
                    total / safeLimit
                )
        }
    };
}

export async function getContributionCycleById(
    cycleId
) {
    if (!cycleId) {
        return null;
    }

    const result = await query(
        `
        SELECT
            c.id,
            c.cycle_name,
            c.starts_at,
            c.due_at,
            c.grace_until,
            c.contribution_amount,
            c.fine_amount,
            c.status,
            c.notes,
            c.created_at,
            c.updated_at,

            COUNT(DISTINCT con.id)::INTEGER
                AS contribution_count,

            COUNT(
                DISTINCT CASE
                    WHEN con.status = 'PAID'
                    THEN con.id
                END
            )::INTEGER
                AS paid_contribution_count,

            COUNT(
                DISTINCT CASE
                    WHEN con.status <> 'PAID'
                        OR con.status IS NULL
                    THEN con.id
                END
            )::INTEGER
                AS outstanding_contribution_count,

            COALESCE(
                SUM(
                    DISTINCT con.expected_amount
                ),
                0
            ) AS expected_amount,

            COALESCE(
                (
                    SELECT SUM(p.amount)
                    FROM baj_payments p
                    INNER JOIN baj_contributions pc
                        ON pc.id = p.contribution_id
                    WHERE pc.cycle_id = c.id
                      AND p.payment_status = 'VERIFIED'
                ),
                0
            ) AS verified_paid_amount

        FROM baj_contribution_cycles c

        LEFT JOIN baj_contributions con
            ON con.cycle_id = c.id

        WHERE c.id = $1

        GROUP BY
            c.id,
            c.cycle_name,
            c.starts_at,
            c.due_at,
            c.grace_until,
            c.contribution_amount,
            c.fine_amount,
            c.status,
            c.notes,
            c.created_at,
            c.updated_at
        `,
        [cycleId]
    );

    if (!result.rows.length) {
        return null;
    }

    const row = result.rows[0];

    const expectedAmount =
        Number(
            row.expected_amount || 0
        );

    const verifiedPaidAmount =
        Number(
            row.verified_paid_amount || 0
        );

    return {
        ...mapCycle(row),

        summary: {
            contribution_count:
                Number(
                    row.contribution_count || 0
                ),

            paid_contribution_count:
                Number(
                    row.paid_contribution_count || 0
                ),

            outstanding_contribution_count:
                Number(
                    row.outstanding_contribution_count || 0
                ),

            expected_amount:
                expectedAmount,

            verified_paid_amount:
                verifiedPaidAmount,

            outstanding_amount:
                Math.max(
                    expectedAmount -
                        verifiedPaidAmount,
                    0
                )
        }
    };
}

export async function createContributionCycle({
    cycleName,
    startsAt,
    dueAt,
    graceUntil,
    contributionAmount,
    fineAmount,
    status = "DRAFT",
    notes = ""
}) {
    const normalizedName =
        String(cycleName || "").trim();

    if (!normalizedName) {
        throw new Error(
            "Cycle name is required."
        );
    }

    const normalizedStatus =
        normalizeStatus(status) ||
        "DRAFT";

    if (
        !ALLOWED_STATUSES.includes(
            normalizedStatus
        )
    ) {
        throw new Error(
            "Invalid contribution cycle status."
        );
    }

    const startDate =
        parseDate(
            startsAt,
            "Start date"
        );

    const dueDate =
        parseDate(
            dueAt,
            "Due date"
        );

    const graceDate =
        parseDate(
            graceUntil,
            "Grace deadline"
        );

    validateCycleDates({
        startsAt: startDate,
        dueAt: dueDate,
        graceUntil: graceDate
    });

    const amount =
        parsePositiveOrZeroNumber(
            contributionAmount,
            "Contribution amount"
        );

    const fine =
        parsePositiveOrZeroNumber(
            fineAmount,
            "Fine amount"
        );

    /*
     * Create the cycle first.
     */
    const result = await query(
        `
        INSERT INTO baj_contribution_cycles (
            cycle_name,
            starts_at,
            due_at,
            grace_until,
            contribution_amount,
            fine_amount,
            status,
            notes
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
            cycle_name,
            starts_at,
            due_at,
            grace_until,
            contribution_amount,
            fine_amount,
            status,
            notes,
            created_at,
            updated_at
        `,
        [
            normalizedName,
            startDate,
            dueDate,
            graceDate,
            amount,
            fine,
            normalizedStatus,
            String(notes || "").trim() ||
                null
        ]
    );

    const cycle = result.rows[0];

    /*
     * Automatically create the contribution records
     * for active members.
     *
     * We do this for every newly-created cycle,
     * regardless of whether the cycle starts as DRAFT,
     * OPEN, or CLOSED.
     */
    await ensureCycleContributions(
        cycle.id,
        amount
    );

    return mapCycle(cycle);
}

export async function updateContributionCycle(
    cycleId,
    {
        cycleName,
        startsAt,
        dueAt,
        graceUntil,
        contributionAmount,
        fineAmount,
        status,
        notes
    }
) {
    if (!cycleId) {
        throw new Error(
            "Contribution cycle ID is required."
        );
    }

    const existingResult =
        await query(
            `
            SELECT
                id,
                cycle_name,
                starts_at,
                due_at,
                grace_until,
                contribution_amount,
                fine_amount,
                status,
                notes
            FROM baj_contribution_cycles
            WHERE id = $1
            `,
            [cycleId]
        );

    if (!existingResult.rows.length) {
        return null;
    }

    const existing =
        existingResult.rows[0];

    const nextCycleName =
        cycleName === undefined
            ? existing.cycle_name
            : String(cycleName).trim();

    if (!nextCycleName) {
        throw new Error(
            "Cycle name is required."
        );
    }

    const nextStartsAt =
        startsAt === undefined
            ? new Date(existing.starts_at)
            : parseDate(
                  startsAt,
                  "Start date"
              );

    const nextDueAt =
        dueAt === undefined
            ? new Date(existing.due_at)
            : parseDate(
                  dueAt,
                  "Due date"
              );

    const nextGraceUntil =
        graceUntil === undefined
            ? new Date(existing.grace_until)
            : parseDate(
                  graceUntil,
                  "Grace deadline"
              );

    validateCycleDates({
        startsAt: nextStartsAt,
        dueAt: nextDueAt,
        graceUntil:
            nextGraceUntil
    });

    const nextContributionAmount =
        contributionAmount === undefined
            ? Number(
                  existing.contribution_amount ||
                      0
              )
            : parsePositiveOrZeroNumber(
                  contributionAmount,
                  "Contribution amount"
              );

    const nextFineAmount =
        fineAmount === undefined
            ? Number(
                  existing.fine_amount ||
                      0
              )
            : parsePositiveOrZeroNumber(
                  fineAmount,
                  "Fine amount"
              );

    const nextStatus =
        status === undefined
            ? existing.status
            : normalizeStatus(status);

    if (
        !ALLOWED_STATUSES.includes(
            nextStatus
        )
    ) {
        throw new Error(
            "Invalid contribution cycle status."
        );
    }

    const nextNotes =
        notes === undefined
            ? existing.notes
            : String(notes).trim() ||
              null;

    const result = await query(
        `
        UPDATE baj_contribution_cycles
        SET
            cycle_name = $1,
            starts_at = $2,
            due_at = $3,
            grace_until = $4,
            contribution_amount = $5,
            fine_amount = $6,
            status = $7,
            notes = $8,
            updated_at = NOW()
        WHERE id = $9
        RETURNING
            id,
            cycle_name,
            starts_at,
            due_at,
            grace_until,
            contribution_amount,
            fine_amount,
            status,
            notes,
            created_at,
            updated_at
        `,
        [
            nextCycleName,
            nextStartsAt,
            nextDueAt,
            nextGraceUntil,
            nextContributionAmount,
            nextFineAmount,
            nextStatus,
            nextNotes,
            cycleId
        ]
    );

    if (!result.rows.length) {
        return null;
    }

    const cycle = result.rows[0];

    /*
     * Ensure that any currently-active member who does not
     * yet have a contribution for this cycle gets one.
     *
     * Existing contribution records are NOT modified.
     * This preserves payment history.
     */
    await ensureCycleContributions(
        cycle.id,
        Number(
            cycle.contribution_amount || 0
        )
    );

    return mapCycle(cycle);
}

export async function updateContributionCycleStatus(
    cycleId,
    status
) {
    if (!cycleId) {
        throw new Error(
            "Contribution cycle ID is required."
        );
    }

    const normalizedStatus =
        normalizeStatus(status);

    if (
        !ALLOWED_STATUSES.includes(
            normalizedStatus
        )
    ) {
        throw new Error(
            "Invalid contribution cycle status."
        );
    }

    const result = await query(
        `
        UPDATE baj_contribution_cycles
        SET
            status = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING
            id,
            cycle_name,
            starts_at,
            due_at,
            grace_until,
            contribution_amount,
            fine_amount,
            status,
            notes,
            created_at,
            updated_at
        `,
        [
            normalizedStatus,
            cycleId
        ]
    );

    if (!result.rows.length) {
        return null;
    }

    const cycle = result.rows[0];

    /*
     * When a cycle is opened, make sure all currently-active
     * members have a contribution record.
     *
     * Missing records only are created.
     * Existing records and payment history remain untouched.
     */
    if (normalizedStatus === "OPEN") {
        await ensureCycleContributions(
            cycle.id,
            Number(
                cycle.contribution_amount || 0
            )
        );
    }

    return mapCycle(cycle);
}


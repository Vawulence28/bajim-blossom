import { query } from "../config/database.js";

const FINE_STATUSES = [
    "OUTSTANDING",
    "PAID",
    "WAIVED"
];

function validateFineStatus(status) {
    if (!FINE_STATUSES.includes(status)) {
        throw new Error(
            `Invalid fine status. Allowed values: ${FINE_STATUSES.join(", ")}`
        );
    }
}

function normalizeDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date supplied.");
    }

    return date.toISOString();
}

function normalizeAmount(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Fine amount must be greater than zero.");
    }

    return amount;
}

export async function listFines({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const safePage = Math.max(
        Number(page) || 1,
        1
    );

    const safeLimit = Math.min(
        Math.max(Number(limit) || 20, 1),
        100
    );

    const offset =
        (safePage - 1) * safeLimit;

    const params = [];
    const conditions = [];

    const normalizedSearch =
        String(search).trim();

    if (normalizedSearch) {
        params.push(
            `%${normalizedSearch}%`
        );

        const parameterIndex =
            params.length;

        conditions.push(`
            (
                pr.full_name ILIKE $${parameterIndex}
                OR pr.phone ILIKE $${parameterIndex}
                OR pr.email ILIKE $${parameterIndex}
                OR pr.member_id ILIKE $${parameterIndex}
                OR c.cycle_name ILIKE $${parameterIndex}
                OR f.reason ILIKE $${parameterIndex}
            )
        `);
    }

    if (status) {
        validateFineStatus(status);

        params.push(status);

        const parameterIndex =
            params.length;

        conditions.push(
            `f.status = $${parameterIndex}`
        );
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join("\nAND ")}`
            : "";

    params.push(safeLimit);

    const limitParameter =
        params.length;

    params.push(offset);

    const offsetParameter =
        params.length;

    const dataResult = await query(
        `
        SELECT
            f.id,
            f.contribution_id,
            f.amount,
            f.reason,
            f.status,
            f.applied_at,
            f.paid_at,
            f.notes,
            f.created_at,
            f.updated_at,

            pr.user_id AS member_user_id,
            pr.id AS member_profile_id,
            pr.member_id,
            pr.full_name,
            pr.phone,
            pr.email,

            c.id AS cycle_id,
            c.cycle_name,
            c.starts_at,
            c.due_at,
            c.grace_until,
            c.contribution_amount,
            c.fine_amount,

            bc.expected_amount AS contribution_expected_amount,
            bc.status AS contribution_status,
            bc.paid_at AS contribution_paid_at

        FROM baj_fines f

        INNER JOIN baj_contributions bc
            ON bc.id = f.contribution_id

        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id

        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id

        ${whereClause}

        ORDER BY
            f.applied_at DESC,
            f.created_at DESC

        LIMIT $${limitParameter}
        OFFSET $${offsetParameter}
        `,
        params
    );

    const countParams = [];
    const countConditions = [];

    if (normalizedSearch) {
        countParams.push(
            `%${normalizedSearch}%`
        );

        const parameterIndex =
            countParams.length;

        countConditions.push(`
            (
                pr.full_name ILIKE $${parameterIndex}
                OR pr.phone ILIKE $${parameterIndex}
                OR pr.email ILIKE $${parameterIndex}
                OR pr.member_id ILIKE $${parameterIndex}
                OR c.cycle_name ILIKE $${parameterIndex}
                OR f.reason ILIKE $${parameterIndex}
            )
        `);
    }

    if (status) {
        countParams.push(status);

        const parameterIndex =
            countParams.length;

        countConditions.push(
            `f.status = $${parameterIndex}`
        );
    }

    const countWhereClause =
        countConditions.length > 0
            ? `WHERE ${countConditions.join("\nAND ")}`
            : "";

    const countResult = await query(
        `
        SELECT
            COUNT(*)::integer AS total

        FROM baj_fines f

        INNER JOIN baj_contributions bc
            ON bc.id = f.contribution_id

        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id

        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id

        ${countWhereClause}
        `,
        countParams
    );

    const total =
        countResult.rows[0]?.total || 0;

    return {
        fines: dataResult.rows,

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

export async function getFineById(
    fineId
) {
    const result = await query(
        `
        SELECT
            f.id,
            f.contribution_id,
            f.amount,
            f.reason,
            f.status,
            f.applied_at,
            f.paid_at,
            f.notes,
            f.created_at,
            f.updated_at,

            pr.user_id AS member_user_id,
            pr.id AS member_profile_id,
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

            bc.expected_amount AS contribution_expected_amount,
            bc.status AS contribution_status,
            bc.paid_at AS contribution_paid_at

        FROM baj_fines f

        INNER JOIN baj_contributions bc
            ON bc.id = f.contribution_id

        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id

        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id

        WHERE f.id = $1

        LIMIT 1
        `,
        [fineId]
    );

    return result.rows[0] || null;
}

export async function listFineContributions({
    search = "",
    limit = 50
} = {}) {
    const safeLimit = Math.min(
        Math.max(Number(limit) || 50, 1),
        100
    );

    const params = [];
    const conditions = [];

    const normalizedSearch =
        String(search).trim();

    if (normalizedSearch) {
        params.push(
            `%${normalizedSearch}%`
        );

        const parameterIndex =
            params.length;

        conditions.push(`
            (
                pr.full_name ILIKE $${parameterIndex}
                OR pr.phone ILIKE $${parameterIndex}
                OR pr.email ILIKE $${parameterIndex}
                OR pr.member_id ILIKE $${parameterIndex}
                OR c.cycle_name ILIKE $${parameterIndex}
            )
        `);
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join("\nAND ")}`
            : "";

    params.push(safeLimit);

    const limitParameter =
        params.length;

    const result = await query(
        `
        SELECT
            bc.id,
            bc.expected_amount,
            bc.status AS contribution_status,
            bc.paid_at,

            pr.user_id AS member_user_id,
            pr.id AS member_profile_id,
            pr.member_id,
            pr.full_name,
            pr.phone,
            pr.email,

            c.id AS cycle_id,
            c.cycle_name,
            c.due_at,
            c.grace_until,
            c.fine_amount,

            COALESCE(
                (
                    SELECT SUM(p.amount)
                    FROM baj_payments p
                    WHERE p.contribution_id = bc.id
                      AND p.payment_status = 'VERIFIED'
                ),
                0
            ) AS verified_paid_amount,

            COALESCE(
                (
                    SELECT SUM(f.amount)
                    FROM baj_fines f
                    WHERE f.contribution_id = bc.id
                      AND f.status = 'OUTSTANDING'
                ),
                0
            ) AS outstanding_fine_amount

        FROM baj_contributions bc

        INNER JOIN baj_profiles pr
            ON pr.id = bc.member_id

        INNER JOIN baj_contribution_cycles c
            ON c.id = bc.cycle_id

        ${whereClause}

        ORDER BY
            c.due_at DESC,
            pr.full_name ASC

        LIMIT $${limitParameter}
        `,
        params
    );

    return result.rows;
}

export async function createFine({
    contributionId,
    amount,
    reason,
    appliedAt,
    notes
}) {
    if (!contributionId) {
        throw new Error(
            "Contribution is required."
        );
    }

    const normalizedAmount =
        normalizeAmount(amount);

    const contributionResult =
        await query(
            `
            SELECT
                bc.id,
                bc.expected_amount,
                bc.status,

                pr.member_id,
                pr.full_name,

                c.cycle_name,
                c.fine_amount

            FROM baj_contributions bc

            INNER JOIN baj_profiles pr
                ON pr.id = bc.member_id

            INNER JOIN baj_contribution_cycles c
                ON c.id = bc.cycle_id

            WHERE bc.id = $1

            LIMIT 1
            `,
            [contributionId]
        );

    const contribution =
        contributionResult.rows[0];

    if (!contribution) {
        throw new Error(
            "The selected contribution was not found."
        );
    }

    const outstandingFineResult =
        await query(
            `
            SELECT
                COALESCE(
                    SUM(amount),
                    0
                ) AS outstanding_amount

            FROM baj_fines

            WHERE contribution_id = $1

              AND status = 'OUTSTANDING'
            `,
            [contributionId]
        );

    const outstandingFineAmount =
        Number(
            outstandingFineResult.rows[0]
                ?.outstanding_amount || 0
        );

    const normalizedAppliedAt =
        normalizeDate(appliedAt) ||
        new Date().toISOString();

    const result = await query(
        `
        INSERT INTO baj_fines (
            contribution_id,
            amount,
            reason,
            status,
            applied_at,
            notes,
            created_at,
            updated_at
        )

        VALUES (
            $1,
            $2,
            $3,
            'OUTSTANDING',
            $4,
            $5,
            NOW(),
            NOW()
        )

        RETURNING *
        `,
        [
            contributionId,
            normalizedAmount,
            reason?.trim() || null,
            normalizedAppliedAt,
            notes?.trim() || null
        ]
    );

    return {
        ...result.rows[0],

        member_id:
            contribution.member_id,

        full_name:
            contribution.full_name,

        cycle_name:
            contribution.cycle_name,

        previous_outstanding_fine_amount:
            outstandingFineAmount
    };
}

export async function updateFineStatus(
    fineId,
    status,
    notes = null
) {
    validateFineStatus(status);

    const existing =
        await getFineById(fineId);

    if (!existing) {
        throw new Error(
            "Fine not found."
        );
    }

    if (
        existing.status === "PAID" &&
        status === "OUTSTANDING"
    ) {
        throw new Error(
            "A paid fine cannot be returned to outstanding status."
        );
    }

    if (
        existing.status === "WAIVED" &&
        status === "OUTSTANDING"
    ) {
        throw new Error(
            "A waived fine cannot be returned to outstanding status."
        );
    }

    const paidAt =
        status === "PAID"
            ? existing.paid_at ||
              new Date().toISOString()
            : null;

    const result = await query(
        `
        UPDATE baj_fines

        SET
            status = $1,
            paid_at = $2,
            notes = COALESCE($3, notes),
            updated_at = NOW()

        WHERE id = $4

        RETURNING *
        `,
        [
            status,
            paidAt,
            notes?.trim() || null,
            fineId
        ]
    );

    return result.rows[0] || null;
}

export async function updateFine(
    fineId,
    {
        amount,
        reason,
        appliedAt,
        notes
    }
) {
    const existing =
        await getFineById(fineId);

    if (!existing) {
        throw new Error(
            "Fine not found."
        );
    }

    if (existing.status !== "OUTSTANDING") {
        throw new Error(
            "Only outstanding fines can be edited."
        );
    }

    const fields = [];
    const values = [];

    if (amount !== undefined) {
        fields.push(
            `amount = $${values.length + 1}`
        );

        values.push(
            normalizeAmount(amount)
        );
    }

    if (reason !== undefined) {
        fields.push(
            `reason = $${values.length + 1}`
        );

        values.push(
            reason?.trim() || null
        );
    }

    if (appliedAt !== undefined) {
        fields.push(
            `applied_at = $${values.length + 1}`
        );

        values.push(
            normalizeDate(appliedAt)
        );
    }

    if (notes !== undefined) {
        fields.push(
            `notes = $${values.length + 1}`
        );

        values.push(
            notes?.trim() || null
        );
    }

    if (fields.length === 0) {
        return existing;
    }

    fields.push(
        "updated_at = NOW()"
    );

    values.push(fineId);

    const result = await query(
        `
        UPDATE baj_fines

        SET ${fields.join(", ")}

        WHERE id = $${values.length}

        RETURNING *
        `,
        values
    );

    return result.rows[0] || null;
}

import { query } from "../config/database.js";

const ITEM_STATUSES = [
    "ASSIGNED",
    "COLLECTED",
    "CANCELLED"
];

function normalizePagination(page = 1, limit = 20) {
    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);

    const safePage =
        Number.isInteger(parsedPage) && parsedPage > 0
            ? parsedPage
            : 1;

    const safeLimit =
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0 &&
        parsedLimit <= 100
            ? parsedLimit
            : 20;

    return {
        page: safePage,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit
    };
}

function validateStatus(status) {
    if (!ITEM_STATUSES.includes(status)) {
        throw new Error(
            `Invalid item status. Allowed statuses: ${ITEM_STATUSES.join(", ")}.`
        );
    }
}

function validateQuantity(quantity) {
    const parsedQuantity = Number.parseInt(quantity, 10);

    if (
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1
    ) {
        throw new Error(
            "Quantity must be a whole number greater than zero."
        );
    }

    return parsedQuantity;
}

/*
 * IMPORTANT:
 * baj_member_items.member_id references baj_profiles.id.
 *
 * It does NOT reference baj_profiles.user_id.
 */
async function ensureMemberExists(memberId) {
    const result = await query(
        `
            SELECT
                pr.id,
                pr.user_id,
                pr.member_id,
                pr.full_name,
                pr.phone,
                pr.email,
                pr.status
            FROM baj_profiles pr
            WHERE pr.id = $1
            LIMIT 1
        `,
        [memberId]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "The selected member does not exist."
        );
    }

    return result.rows[0];
}

export async function listMemberItems({
    search = "",
    status = "",
    page = 1,
    limit = 20
} = {}) {
    const pagination = normalizePagination(
        page,
        limit
    );

    const conditions = [];
    const values = [];

    if (search.trim()) {
        values.push(`%${search.trim()}%`);

        conditions.push(`
            (
                pr.full_name ILIKE $${values.length}
                OR pr.member_id ILIKE $${values.length}
                OR pr.phone ILIKE $${values.length}
                OR pr.email ILIKE $${values.length}
                OR mi.item_name ILIKE $${values.length}
                OR mi.item_description ILIKE $${values.length}
            )
        `);
    }

    if (status) {
        validateStatus(status);

        values.push(status);

        conditions.push(
            `mi.status = $${values.length}`
        );
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const countResult = await query(
        `
            SELECT COUNT(*)::integer AS total
            FROM baj_member_items mi
            INNER JOIN baj_profiles pr
                ON pr.id = mi.member_id
            ${whereClause}
        `,
        values
    );

    const total = countResult.rows[0]?.total || 0;

    values.push(pagination.limit);
    const limitPosition = values.length;

    values.push(pagination.offset);
    const offsetPosition = values.length;

    const result = await query(
        `
            SELECT
                mi.id,
                mi.member_id,
                mi.item_name,
                mi.item_description,
                mi.quantity,
                mi.status,
                mi.assigned_at,
                mi.collected_at,
                mi.notes,
                mi.created_at,
                mi.updated_at,
                pr.member_id AS member_code,
                pr.full_name AS member_name,
                pr.phone AS member_phone,
                pr.email AS member_email
            FROM baj_member_items mi
            INNER JOIN baj_profiles pr
                ON pr.id = mi.member_id
            ${whereClause}
            ORDER BY mi.created_at DESC
            LIMIT $${limitPosition}
            OFFSET $${offsetPosition}
        `,
        values
    );

    const totalPages =
        total === 0
            ? 0
            : Math.ceil(
                  total / pagination.limit
              );

    return {
        items: result.rows,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages
        }
    };
}

export async function getMemberItemById(itemId) {
    const result = await query(
        `
            SELECT
                mi.id,
                mi.member_id,
                mi.item_name,
                mi.item_description,
                mi.quantity,
                mi.status,
                mi.assigned_at,
                mi.collected_at,
                mi.notes,
                mi.created_at,
                mi.updated_at,
                pr.member_id AS member_code,
                pr.full_name AS member_name,
                pr.phone AS member_phone,
                pr.email AS member_email,
                pr.address AS member_address
            FROM baj_member_items mi
            INNER JOIN baj_profiles pr
                ON pr.id = mi.member_id
            WHERE mi.id = $1
            LIMIT 1
        `,
        [itemId]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "Member item not found."
        );
    }

    return result.rows[0];
}

export async function listMembersForItems({
    search = "",
    limit = 50
} = {}) {
    const parsedLimit =
        Number.parseInt(limit, 10);

    const safeLimit =
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0 &&
        parsedLimit <= 100
            ? parsedLimit
            : 50;

    const values = [];
    let whereClause = "";

    if (search.trim()) {
        values.push(
            `%${search.trim()}%`
        );

        whereClause = `
            WHERE
                pr.full_name ILIKE $1
                OR pr.member_id ILIKE $1
                OR pr.phone ILIKE $1
                OR pr.email ILIKE $1
        `;
    }

    values.push(safeLimit);

    const result = await query(
        `
            SELECT
                pr.id AS profile_id,
                pr.user_id,
                pr.member_id,
                pr.full_name,
                pr.phone,
                pr.email,
                pr.status
            FROM baj_profiles pr
            ${whereClause}
            ORDER BY pr.full_name ASC
            LIMIT $${values.length}
        `,
        values
    );

    return {
        members: result.rows
    };
}

export async function createMemberItem({
    memberId,
    itemName,
    itemDescription = null,
    quantity = 1,
    assignedAt = null,
    notes = null
}) {
    if (!memberId) {
        throw new Error(
            "Member is required."
        );
    }

    if (
        !itemName ||
        !itemName.trim()
    ) {
        throw new Error(
            "Item name is required."
        );
    }

    const parsedQuantity =
        validateQuantity(quantity);

    await ensureMemberExists(
        memberId
    );

    const result = await query(
        `
            INSERT INTO baj_member_items (
                member_id,
                item_name,
                item_description,
                quantity,
                status,
                assigned_at,
                notes
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                'ASSIGNED',
                COALESCE($5::timestamptz, NOW()),
                $6
            )
            RETURNING
                id,
                member_id,
                item_name,
                item_description,
                quantity,
                status,
                assigned_at,
                collected_at,
                notes,
                created_at,
                updated_at
        `,
        [
            memberId,
            itemName.trim(),
            itemDescription?.trim() || null,
            parsedQuantity,
            assignedAt || null,
            notes?.trim() || null
        ]
    );

    /*
     * The inserted row uses member_id = baj_profiles.id.
     * getMemberItemById() now uses the same relationship.
     */
    return getMemberItemById(
        result.rows[0].id
    );
}

export async function updateMemberItem(
    itemId,
    {
        itemName,
        itemDescription,
        quantity,
        assignedAt,
        notes
    }
) {
    const existing =
        await getMemberItemById(
            itemId
        );

    if (
        existing.status !== "ASSIGNED"
    ) {
        throw new Error(
            "Only assigned items can be edited."
        );
    }

    const updates = [];
    const values = [];

    if (
        itemName !== undefined
    ) {
        if (
            !itemName ||
            !itemName.trim()
        ) {
            throw new Error(
                "Item name cannot be empty."
            );
        }

        values.push(
            itemName.trim()
        );

        updates.push(
            `item_name = $${values.length}`
        );
    }

    if (
        itemDescription !== undefined
    ) {
        values.push(
            itemDescription?.trim() ||
                null
        );

        updates.push(
            `item_description = $${values.length}`
        );
    }

    if (
        quantity !== undefined
    ) {
        const parsedQuantity =
            validateQuantity(
                quantity
            );

        values.push(
            parsedQuantity
        );

        updates.push(
            `quantity = $${values.length}`
        );
    }

    if (
        assignedAt !== undefined
    ) {
        values.push(
            assignedAt || null
        );

        updates.push(
            `assigned_at = COALESCE($${values.length}::timestamptz, NOW())`
        );
    }

    if (
        notes !== undefined
    ) {
        values.push(
            notes?.trim() || null
        );

        updates.push(
            `notes = $${values.length}`
        );
    }

    if (updates.length === 0) {
        return existing;
    }

    values.push(itemId);

    await query(
        `
            UPDATE baj_member_items
            SET
                ${updates.join(", ")},
                updated_at = NOW()
            WHERE id = $${values.length}
        `,
        values
    );

    return getMemberItemById(
        itemId
    );
}

export async function updateMemberItemStatus(
    itemId,
    status,
    notes = null
) {
    validateStatus(status);

    const existing =
        await getMemberItemById(
            itemId
        );

    if (
        existing.status ===
            "COLLECTED" &&
        status !== "COLLECTED"
    ) {
        throw new Error(
            "A collected item cannot be moved back to another status."
        );
    }

    if (
        existing.status ===
            "CANCELLED" &&
        status !== "CANCELLED"
    ) {
        throw new Error(
            "A cancelled item cannot be reopened."
        );
    }

    let collectedAt =
        existing.collected_at;

    if (
        status === "COLLECTED"
    ) {
        collectedAt =
            existing.collected_at ||
            new Date().toISOString();
    }

    if (
        status !== "COLLECTED"
    ) {
        collectedAt = null;
    }

    await query(
        `
            UPDATE baj_member_items
            SET
                status = $1,
                collected_at = $2,
                notes = COALESCE($3, notes),
                updated_at = NOW()
            WHERE id = $4
        `,
        [
            status,
            collectedAt,
            notes?.trim() || null,
            itemId
        ]
    );

    return getMemberItemById(
        itemId
    );
}

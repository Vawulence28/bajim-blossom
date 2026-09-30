import pool from "../config/database.js";

import {
    initializeDefaultSettings,
    getPublicSettings
} from "./settings.service.js";

const CONTACT_ENQUIRY_STATUSES = [
    "NEW",
    "IN_PROGRESS",
    "RESOLVED",
    "ARCHIVED"
];

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function normalizeString(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

function normalizeEmail(value) {
    return normalizeString(value).toLowerCase();
}

function validateFullName(fullName) {
    if (!fullName) {
        throw new Error("Full name is required.");
    }

    if (fullName.length < 2) {
        throw new Error(
            "Full name must contain at least 2 characters."
        );
    }

    if (fullName.length > 150) {
        throw new Error(
            "Full name must not exceed 150 characters."
        );
    }
}

function validateEmail(email) {
    if (!email) {
        throw new Error("Email address is required.");
    }

    if (email.length > 255) {
        throw new Error(
            "Email address must not exceed 255 characters."
        );
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        throw new Error(
            "Please provide a valid email address."
        );
    }
}

function validateMessage(message) {
    if (!message) {
        throw new Error("Message is required.");
    }

    if (message.length < 5) {
        throw new Error(
            "Message must contain at least 5 characters."
        );
    }

    if (message.length > 5000) {
        throw new Error(
            "Message must not exceed 5000 characters."
        );
    }
}

function validateStatus(status) {
    if (!CONTACT_ENQUIRY_STATUSES.includes(status)) {
        throw new Error(
            `Invalid enquiry status. Allowed statuses: ${CONTACT_ENQUIRY_STATUSES.join(
                ", "
            )}.`
        );
    }
}

function normalizePagination(limit, offset) {
    const parsedLimit = Number.parseInt(
        limit,
        10
    );

    const parsedOffset = Number.parseInt(
        offset,
        10
    );

    const safeLimit =
        Number.isFinite(parsedLimit) &&
        parsedLimit > 0
            ? Math.min(parsedLimit, MAX_LIMIT)
            : DEFAULT_LIMIT;

    const safeOffset =
        Number.isFinite(parsedOffset) &&
        parsedOffset >= 0
            ? parsedOffset
            : 0;

    return {
        limit: safeLimit,
        offset: safeOffset
    };
}

/**
 * Get the public organization contact information
 * from the existing baj_settings table.
 */
export async function getPublicContactInformation() {
    await initializeDefaultSettings();

    const settings =
        await getPublicSettings();

    return {
        organization_name:
            settings.organization_name || "",

        organization_description:
            settings.organization_description || "",

        organization_phone:
            settings.organization_phone || "",

        organization_email:
            settings.organization_email || "",

        organization_address:
            settings.organization_address || ""
    };
}

/**
 * Create a public contact enquiry.
 */
export async function createContactEnquiry({
    fullName,
    email,
    message
}) {
    const normalizedFullName =
        normalizeString(fullName);

    const normalizedEmail =
        normalizeEmail(email);

    const normalizedMessage =
        normalizeString(message);

    validateFullName(
        normalizedFullName
    );

    validateEmail(
        normalizedEmail
    );

    validateMessage(
        normalizedMessage
    );

    const query = `
        INSERT INTO baj_contact_enquiries (
            full_name,
            email,
            message,
            status
        )
        VALUES ($1, $2, $3, 'NEW')
        RETURNING
            id,
            full_name,
            email,
            message,
            status,
            admin_notes,
            resolved_at,
            resolved_by,
            created_at,
            updated_at
    `;

    const values = [
        normalizedFullName,
        normalizedEmail,
        normalizedMessage
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
}

/**
 * Get admin enquiry list.
 */
export async function getContactEnquiries({
    status = "",
    search = "",
    limit = DEFAULT_LIMIT,
    offset = 0
} = {}) {
    const conditions = [];
    const values = [];

    const normalizedStatus =
        normalizeString(status).toUpperCase();

    const normalizedSearch =
        normalizeString(search);

    if (normalizedStatus) {
        validateStatus(
            normalizedStatus
        );

        values.push(
            normalizedStatus
        );

        conditions.push(
            `ce.status = $${values.length}`
        );
    }

    if (normalizedSearch) {
        values.push(
            `%${normalizedSearch}%`
        );

        const placeholder =
            `$${values.length}`;

        conditions.push(`
            (
                ce.full_name ILIKE ${placeholder}
                OR ce.email ILIKE ${placeholder}
                OR ce.message ILIKE ${placeholder}
            )
        `);
    }

    const {
        limit: safeLimit,
        offset: safeOffset
    } = normalizePagination(
        limit,
        offset
    );

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join("\nAND ")}`
            : "";

    const countQuery = `
        SELECT COUNT(*)::INTEGER AS total
        FROM baj_contact_enquiries ce
        ${whereClause}
    `;

    const countResult =
        await pool.query(
            countQuery,
            values
        );

    const total =
        countResult.rows[0]?.total || 0;

    const dataValues = [
        ...values,
        safeLimit,
        safeOffset
    ];

    const limitPlaceholder =
        `$${dataValues.length - 1}`;

    const offsetPlaceholder =
        `$${dataValues.length}`;

    const dataQuery = `
        SELECT
            ce.id,
            ce.full_name,
            ce.email,
            ce.message,
            ce.status,
            ce.admin_notes,
            ce.resolved_at,
            ce.resolved_by,
            ce.created_at,
            ce.updated_at,

            resolved_profile.full_name
                AS resolved_by_name,

            resolved_profile.member_id
                AS resolved_by_member_id

        FROM baj_contact_enquiries ce

        LEFT JOIN baj_profiles resolved_profile
            ON resolved_profile.id = ce.resolved_by

        ${whereClause}

        ORDER BY ce.created_at DESC

        LIMIT ${limitPlaceholder}
        OFFSET ${offsetPlaceholder}
    `;

    const result = await pool.query(
        dataQuery,
        dataValues
    );

    return {
        enquiries: result.rows,
        pagination: {
            total,
            limit: safeLimit,
            offset: safeOffset,
            hasMore:
                safeOffset + result.rows.length <
                total
        }
    };
}

/**
 * Get one enquiry by ID.
 */
export async function getContactEnquiryById(
    id
) {
    const enquiryId =
        normalizeString(id);

    if (!enquiryId) {
        throw new Error(
            "Enquiry ID is required."
        );
    }

    const query = `
        SELECT
            ce.id,
            ce.full_name,
            ce.email,
            ce.message,
            ce.status,
            ce.admin_notes,
            ce.resolved_at,
            ce.resolved_by,
            ce.created_at,
            ce.updated_at,

            resolved_profile.full_name
                AS resolved_by_name,

            resolved_profile.member_id
                AS resolved_by_member_id

        FROM baj_contact_enquiries ce

        LEFT JOIN baj_profiles resolved_profile
            ON resolved_profile.id = ce.resolved_by

        WHERE ce.id = $1

        LIMIT 1
    `;

    const result = await pool.query(
        query,
        [enquiryId]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Contact enquiry not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return result.rows[0];
}

/**
 * Update an enquiry from the admin panel.
 */
export async function updateContactEnquiry(
    id,
    {
        status,
        adminNotes,
        userId
    }
) {
    const enquiryId =
        normalizeString(id);

    if (!enquiryId) {
        throw new Error(
            "Enquiry ID is required."
        );
    }

    const existing =
        await getContactEnquiryById(
            enquiryId
        );

    const nextStatus =
        status === undefined ||
        status === null ||
        normalizeString(status) === ""
            ? existing.status
            : normalizeString(status).toUpperCase();

    validateStatus(
        nextStatus
    );

    const nextAdminNotes =
        adminNotes === undefined ||
        adminNotes === null
            ? existing.admin_notes
            : normalizeString(adminNotes);

    if (nextAdminNotes !== null &&
        nextAdminNotes.length > 10000) {
        throw new Error(
            "Admin notes must not exceed 10000 characters."
        );
    }

    let resolvedAt =
        existing.resolved_at;

    let resolvedBy =
        existing.resolved_by;

    const isChangingToResolved =
        nextStatus === "RESOLVED" &&
        existing.status !== "RESOLVED";

    const isChangingAwayFromResolved =
        nextStatus !== "RESOLVED" &&
        existing.status === "RESOLVED";

    if (isChangingToResolved) {
        resolvedAt = new Date();

        resolvedBy =
            userId || null;
    }

    if (isChangingAwayFromResolved) {
        resolvedAt = null;
        resolvedBy = null;
    }

    const query = `
        UPDATE baj_contact_enquiries

        SET
            status = $1,
            admin_notes = $2,
            resolved_at = $3,
            resolved_by = $4,
            updated_at = NOW()

        WHERE id = $5

        RETURNING
            id,
            full_name,
            email,
            message,
            status,
            admin_notes,
            resolved_at,
            resolved_by,
            created_at,
            updated_at
    `;

    const values = [
        nextStatus,
        nextAdminNotes || null,
        resolvedAt,
        resolvedBy,
        enquiryId
    ];

    const result = await pool.query(
        query,
        values
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Contact enquiry not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return getContactEnquiryById(
        enquiryId
    );
}

/**
 * Expose the available enquiry statuses.
 */
export function getContactEnquiryStatuses() {
    return [
        ...CONTACT_ENQUIRY_STATUSES
    ];
}
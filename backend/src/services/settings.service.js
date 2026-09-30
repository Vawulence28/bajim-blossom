import { query } from "../config/database.js";

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

export const DEFAULT_SETTINGS = [
    {
        key: "organization_name",
        value: "BAJIM BLOSSOM KITCHEN & HOUSEHOLD ITEMS",
        type: "STRING",
        description:
            "Name of the organization displayed throughout the system.",
        isPublic: true
    },
    {
        key: "organization_description",
        value: "",
        type: "STRING",
        description:
            "Short description of the organization.",
        isPublic: true
    },
    {
        key: "organization_phone",
        value: "",
        type: "STRING",
        description:
            "Official organization contact phone number.",
        isPublic: true
    },
    {
        key: "organization_email",
        value: "",
        type: "STRING",
        description:
            "Official organization contact email address.",
        isPublic: true
    },
    {
        key: "organization_address",
        value: "",
        type: "STRING",
        description:
            "Official organization address.",
        isPublic: true
    },
    {
        key: "application_name",
        value: "BAJIM Blossom",
        type: "STRING",
        description:
            "Application name used in the administration interface.",
        isPublic: true
    },
    {
        key: "currency",
        value: "NGN",
        type: "STRING",
        description:
            "Application currency code.",
        isPublic: true
    },
    {
        key: "timezone",
        value: "Africa/Lagos",
        type: "STRING",
        description:
            "Application timezone.",
        isPublic: true
    },
    {
        key: "date_format",
        value: "DD/MM/YYYY",
        type: "STRING",
        description:
            "Preferred date display format.",
        isPublic: true
    },
    {
        key: "default_contribution_amount",
        value: "3000",
        type: "NUMBER",
        description:
            "Default contribution amount used when creating a new contribution cycle.",
        isPublic: false
    },
    {
        key: "default_contribution_frequency",
        value: "WEEKLY",
        type: "STRING",
        description:
            "Default contribution frequency for new contribution cycles.",
        isPublic: false
    },
    {
        key: "default_contribution_due_day",
        value: "FRIDAY",
        type: "STRING",
        description:
            "Default contribution due day for new contribution cycles.",
        isPublic: false
    },
    {
        key: "default_contribution_due_time",
        value: "22:00",
        type: "STRING",
        description:
            "Default contribution due time for new contribution cycles.",
        isPublic: false
    },
    {
        key: "default_contribution_grace_day",
        value: "SATURDAY",
        type: "STRING",
        description:
            "Default grace-period day for new contribution cycles.",
        isPublic: false
    },
    {
        key: "default_contribution_grace_time",
        value: "10:00",
        type: "STRING",
        description:
            "Default grace-period time for new contribution cycles.",
        isPublic: false
    },
    {
        key: "default_fine_amount",
        value: "500",
        type: "NUMBER",
        description:
            "Default fine amount used when creating or applying new cycle fines.",
        isPublic: false
    },
    {
        key: "member_registration_enabled",
        value: "true",
        type: "BOOLEAN",
        description:
            "Controls whether new members can submit registration requests.",
        isPublic: false
    },
    {
        key: "member_registration_requires_approval",
        value: "true",
        type: "BOOLEAN",
        description:
            "Controls whether new member registrations require administrator approval.",
        isPublic: false
    },
    {
        key: "maintenance_mode",
        value: "false",
        type: "BOOLEAN",
        description:
            "Controls whether the application is in maintenance mode.",
        isPublic: false
    }
];

/* =========================================================
   VALUE HELPERS
========================================================= */

function parseSettingValue(value, type) {
    if (value === null || value === undefined) {
        return null;
    }

    switch (type) {
        case "NUMBER": {
            const number = Number(value);

            if (!Number.isFinite(number)) {
                throw new Error(
                    "Stored setting contains an invalid number."
                );
            }

            return number;
        }

        case "BOOLEAN":
            return String(value).toLowerCase() === "true";

        case "JSON":
            try {
                return JSON.parse(value);
            } catch {
                throw new Error(
                    "Stored setting contains invalid JSON."
                );
            }

        case "STRING":
        default:
            return String(value);
    }
}

function serializeSettingValue(value, type) {
    switch (type) {
        case "NUMBER": {
            const number = Number(value);

            if (
                value === "" ||
                value === null ||
                value === undefined ||
                !Number.isFinite(number)
            ) {
                throw new Error(
                    "Setting value must be a valid number."
                );
            }

            return String(number);
        }

        case "BOOLEAN":
            if (typeof value !== "boolean") {
                throw new Error(
                    "Setting value must be true or false."
                );
            }

            return String(value);

        case "JSON":
            try {
                return JSON.stringify(value);
            } catch {
                throw new Error(
                    "Setting value could not be converted to JSON."
                );
            }

        case "STRING":
        default:
            return String(value ?? "");
    }
}

/* =========================================================
   AUTHENTICATED USER → PROFILE
========================================================= */

async function getActorProfileId(userId) {
    const result = await query(
        `
            SELECT id
            FROM baj_profiles
            WHERE user_id = $1
            LIMIT 1
        `,
        [userId]
    );

    if (!result.rows.length) {
        const error = new Error(
            "Administrator profile could not be found."
        );

        error.status = 403;

        throw error;
    }

    return result.rows[0].id;
}

/* =========================================================
   INITIALIZE DEFAULT SETTINGS
========================================================= */

export async function initializeDefaultSettings() {
    for (const setting of DEFAULT_SETTINGS) {
        await query(
            `
                INSERT INTO baj_settings (
                    setting_key,
                    setting_value,
                    setting_type,
                    description,
                    is_public
                )
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (setting_key)
                DO NOTHING
            `,
            [
                setting.key,
                setting.value,
                setting.type,
                setting.description,
                setting.isPublic
            ]
        );
    }
}

/* =========================================================
   FORMAT SETTING
========================================================= */

function formatSetting(setting) {
    return {
        id: setting.id,
        key: setting.setting_key,
        value: parseSettingValue(
            setting.setting_value,
            setting.setting_type
        ),
        type: setting.setting_type,
        description: setting.description,
        isPublic: setting.is_public,
        updatedBy: setting.updated_by,
        createdAt: setting.created_at,
        updatedAt: setting.updated_at
    };
}

/* =========================================================
   GET ALL SETTINGS
========================================================= */

export async function getAllSettings() {
    await initializeDefaultSettings();

    const result = await query(
        `
            SELECT
                id,
                setting_key,
                setting_value,
                setting_type,
                description,
                is_public,
                updated_by,
                created_at,
                updated_at
            FROM baj_settings
            ORDER BY setting_key ASC
        `
    );

    return result.rows.map(formatSetting);
}

/* =========================================================
   GET SINGLE SETTING
========================================================= */

export async function getSettingByKey(settingKey) {
    await initializeDefaultSettings();

    const result = await query(
        `
            SELECT
                id,
                setting_key,
                setting_value,
                setting_type,
                description,
                is_public,
                updated_by,
                created_at,
                updated_at
            FROM baj_settings
            WHERE setting_key = $1
            LIMIT 1
        `,
        [settingKey]
    );

    if (!result.rows.length) {
        return null;
    }

    return formatSetting(result.rows[0]);
}

/* =========================================================
   UPDATE SETTING
========================================================= */

export async function updateSetting(
    settingKey,
    value,
    userId
) {
    await initializeDefaultSettings();

    const existing = await query(
        `
            SELECT
                id,
                setting_key,
                setting_type,
                description,
                is_public
            FROM baj_settings
            WHERE setting_key = $1
            LIMIT 1
        `,
        [settingKey]
    );

    if (!existing.rows.length) {
        const error = new Error(
            "The requested setting does not exist."
        );

        error.status = 404;

        throw error;
    }

    const setting = existing.rows[0];

    const serializedValue =
        serializeSettingValue(
            value,
            setting.setting_type
        );

    const profileId =
        await getActorProfileId(userId);

    const result = await query(
        `
            UPDATE baj_settings
            SET
                setting_value = $1,
                updated_by = $2,
                updated_at = NOW()
            WHERE setting_key = $3
            RETURNING
                id,
                setting_key,
                setting_value,
                setting_type,
                description,
                is_public,
                updated_by,
                created_at,
                updated_at
        `,
        [
            serializedValue,
            profileId,
            settingKey
        ]
    );

    return formatSetting(result.rows[0]);
}

/* =========================================================
   GET PUBLIC SETTINGS
========================================================= */

export async function getPublicSettings() {
    await initializeDefaultSettings();

    const result = await query(
        `
            SELECT
                setting_key,
                setting_value,
                setting_type
            FROM baj_settings
            WHERE is_public = TRUE
            ORDER BY setting_key ASC
        `
    );

    const settings = {};

    for (const setting of result.rows) {
        settings[setting.setting_key] =
            parseSettingValue(
                setting.setting_value,
                setting.setting_type
            );
    }

    return settings;
}

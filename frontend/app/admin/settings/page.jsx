"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getAdminSettings,
    updateAdminSetting
} from "../../../services/adminApi";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminMobileNav from "../../../components/admin/AdminMobileNav";

const SECTION_DEFINITIONS = {
    organization: {
        title: "Organization",
        description:
            "Basic information about BAJIM Blossom.",
        keys: [
            "organization_name",
            "organization_description",
            "organization_phone",
            "organization_email",
            "organization_address"
        ]
    },
    application: {
        title: "Application",
        description:
            "General application preferences.",
        keys: [
            "application_name",
            "currency",
            "timezone",
            "date_format"
        ]
    },
    contribution: {
        title: "Contribution Defaults",
        description:
            "Default values used when creating future contribution cycles.",
        keys: [
            "default_contribution_amount",
            "default_contribution_frequency",
            "default_contribution_due_day",
            "default_contribution_due_time",
            "default_contribution_grace_day",
            "default_contribution_grace_time",
            "default_fine_amount"
        ]
    },
    system: {
        title: "System Preferences",
        description:
            "Controls for member registration and application availability.",
        keys: [
            "member_registration_enabled",
            "member_registration_requires_approval",
            "maintenance_mode"
        ]
    }
};

const SETTING_LABELS = {
    organization_name:
        "Organization Name",
    organization_description:
        "Organization Description",
    organization_phone:
        "Organization Phone",
    organization_email:
        "Organization Email",
    organization_address:
        "Organization Address",
    application_name:
        "Application Name",
    currency:
        "Currency",
    timezone:
        "Timezone",
    date_format:
        "Date Format",
    default_contribution_amount:
        "Default Contribution Amount",
    default_contribution_frequency:
        "Contribution Frequency",
    default_contribution_due_day:
        "Contribution Due Day",
    default_contribution_due_time:
        "Contribution Due Time",
    default_contribution_grace_day:
        "Grace Period Day",
    default_contribution_grace_time:
        "Grace Period Time",
    default_fine_amount:
        "Default Fine Amount",
    member_registration_enabled:
        "Member Registration",
    member_registration_requires_approval:
        "Registration Approval Required",
    maintenance_mode:
        "Maintenance Mode"
};

const SELECT_OPTIONS = {
    currency: [
        {
            value: "NGN",
            label: "NGN — Nigerian Naira"
        }
    ],
    timezone: [
        {
            value: "Africa/Lagos",
            label: "Africa/Lagos"
        }
    ],
    date_format: [
        {
            value: "DD/MM/YYYY",
            label: "DD/MM/YYYY"
        },
        {
            value: "MM/DD/YYYY",
            label: "MM/DD/YYYY"
        },
        {
            value: "YYYY-MM-DD",
            label: "YYYY-MM-DD"
        }
    ],
    default_contribution_frequency: [
        {
            value: "WEEKLY",
            label: "Weekly"
        }
    ],
    default_contribution_due_day: [
        {
            value: "MONDAY",
            label: "Monday"
        },
        {
            value: "TUESDAY",
            label: "Tuesday"
        },
        {
            value: "WEDNESDAY",
            label: "Wednesday"
        },
        {
            value: "THURSDAY",
            label: "Thursday"
        },
        {
            value: "FRIDAY",
            label: "Friday"
        },
        {
            value: "SATURDAY",
            label: "Saturday"
        },
        {
            value: "SUNDAY",
            label: "Sunday"
        }
    ],
    default_contribution_grace_day: [
        {
            value: "MONDAY",
            label: "Monday"
        },
        {
            value: "TUESDAY",
            label: "Tuesday"
        },
        {
            value: "WEDNESDAY",
            label: "Wednesday"
        },
        {
            value: "THURSDAY",
            label: "Thursday"
        },
        {
            value: "FRIDAY",
            label: "Friday"
        },
        {
            value: "SATURDAY",
            label: "Saturday"
        },
        {
            value: "SUNDAY",
            label: "Sunday"
        }
    ]
};

function formatSettingValue(setting) {
    if (!setting) {
        return "";
    }

    if (setting.type === "BOOLEAN") {
        return Boolean(setting.value);
    }

    return setting.value ?? "";
}

function getInputType(setting) {
    if (!setting) {
        return "text";
    }

    if (setting.type === "NUMBER") {
        return "number";
    }

    if (setting.type === "BOOLEAN") {
        return "boolean";
    }

    if (SELECT_OPTIONS[setting.key]) {
        return "select";
    }

    if (
        setting.key.includes("description") ||
        setting.key.includes("address")
    ) {
        return "textarea";
    }

    if (setting.key.endsWith("_time")) {
        return "time";
    }

    return "text";
}

function SettingField({
    setting,
    value,
    onChange,
    saving
}) {
    if (!setting) {
        return null;
    }

    const inputType =
        getInputType(setting);

    const label =
        SETTING_LABELS[setting.key] ||
        setting.key;

    if (setting.type === "BOOLEAN") {
        return (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 pr-2">
                        <label className="block break-words text-sm font-semibold text-stone-900 sm:text-base">
                            {label}
                        </label>

                        {setting.description && (
                            <p className="mt-1.5 break-words text-sm leading-5 text-stone-500">
                                {setting.description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                            onChange(
                                !Boolean(value)
                            )
                        }
                        className={`relative mt-0.5 h-8 w-14 shrink-0 rounded-full transition-colors ${
                            value
                                ? "bg-emerald-600"
                                : "bg-stone-300"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                        aria-label={`${label}: ${
                            value
                                ? "Enabled"
                                : "Disabled"
                        }`}
                        aria-pressed={Boolean(
                            value
                        )}
                    >
                        <span
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
                                value
                                    ? "left-7"
                                    : "left-1"
                            }`}
                        />
                    </button>
                </div>

                <p className="mt-3 text-xs font-semibold text-stone-500">
                    {value
                        ? "Enabled"
                        : "Disabled"}
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0">
            <label
                htmlFor={setting.key}
                className="mb-2 block break-words text-sm font-medium text-stone-800"
            >
                {label}
            </label>

            {inputType === "textarea" ? (
                <textarea
                    id={setting.key}
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    disabled={saving}
                    rows={4}
                    className="min-h-28 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm leading-6 text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-100 sm:min-h-32"
                />
            ) : inputType === "select" ? (
                <select
                    id={setting.key}
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    disabled={saving}
                    className="min-h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-100"
                >
                    {SELECT_OPTIONS[
                        setting.key
                    ].map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={setting.key}
                    type={inputType}
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    disabled={saving}
                    min={
                        inputType === "number"
                            ? "0"
                            : undefined
                    }
                    className="min-h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-100"
                />
            )}

            {setting.description && (
                <p className="mt-1.5 break-words text-xs leading-5 text-stone-500">
                    {setting.description}
                </p>
            )}
        </div>
    );
}

function SettingsSection({
    title,
    description,
    settings,
    values,
    savingKey,
    onChange,
    onSave
}) {
    const changedKeys =
        settings.filter(
            (setting) =>
                JSON.stringify(
                    values[setting.key]
                ) !==
                JSON.stringify(
                    formatSettingValue(
                        setting
                    )
                )
        );

    return (
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="break-words text-lg font-semibold text-stone-900 sm:text-xl">
                    {title}
                </h2>

                <p className="mt-1.5 max-w-3xl break-words text-sm leading-5 text-stone-500 sm:leading-6">
                    {description}
                </p>
            </div>

            <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                {settings.length === 0 ? (
                    <p className="rounded-xl bg-stone-50 px-4 py-5 text-sm text-stone-500">
                        No settings are available
                        in this section.
                    </p>
                ) : (
                    settings.map((setting) => (
                        <SettingField
                            key={setting.key}
                            setting={setting}
                            value={
                                values[
                                    setting.key
                                ]
                            }
                            saving={
                                savingKey ===
                                setting.key
                            }
                            onChange={(
                                value
                            ) =>
                                onChange(
                                    setting.key,
                                    value
                                )
                            }
                        />
                    ))
                )}
            </div>

            {changedKeys.length > 0 && (
                <div className="border-t border-stone-200 bg-stone-50 px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="break-words text-sm leading-5 text-stone-600">
                            {changedKeys.length}{" "}
                            setting
                            {changedKeys.length ===
                            1
                                ? ""
                                : "s"}{" "}
                            changed.
                        </p>

                        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                            {changedKeys.map(
                                (setting) => (
                                    <button
                                        key={
                                            setting.key
                                        }
                                        type="button"
                                        disabled={
                                            savingKey !==
                                            null
                                        }
                                        onClick={() =>
                                            onSave(
                                                setting
                                            )
                                        }
                                        className="min-h-11 w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        {savingKey ===
                                        setting.key
                                            ? "Saving..."
                                            : `Save ${
                                                  SETTING_LABELS[
                                                      setting.key
                                                  ] ||
                                                  setting.key
                                              }`}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function AdminSettingsPage() {
    const [settings, setSettings] =
        useState([]);

    const [values, setValues] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [savingKey, setSavingKey] =
        useState(null);

    const loadSettings =
        useCallback(async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getAdminSettings();

                const receivedSettings =
                    response?.data || [];

                setSettings(
                    receivedSettings
                );

                const initialValues = {};

                receivedSettings.forEach(
                    (setting) => {
                        initialValues[
                            setting.key
                        ] =
                            formatSettingValue(
                                setting
                            );
                    }
                );

                setValues(
                    initialValues
                );
            } catch (requestError) {
                setError(
                    requestError?.message ||
                        "Unable to load settings."
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        let active = true;

        async function run() {
            await Promise.resolve();

            if (!active) {
                return;
            }

            await loadSettings();
        }

        run();

        return () => {
            active = false;
        };
    }, [loadSettings]);

    const settingsMap = useMemo(() => {
        const map = {};

        settings.forEach((setting) => {
            map[setting.key] = setting;
        });

        return map;
    }, [settings]);

    const handleChange = (
        key,
        value
    ) => {
        setSuccess("");

        setValues((current) => ({
            ...current,
            [key]: value
        }));
    };

    const handleSave = async (
        setting
    ) => {
        try {
            setSavingKey(setting.key);
            setError("");
            setSuccess("");

            let value =
                values[setting.key];

            if (
                setting.type ===
                "NUMBER"
            ) {
                value = Number(value);
            }

            await updateAdminSetting(
                setting.key,
                value
            );

            setSuccess(
                `${
                    SETTING_LABELS[
                        setting.key
                    ] ||
                    setting.key
                } updated successfully.`
            );

            await loadSettings();
        } catch (requestError) {
            setError(
                requestError?.message ||
                    "Unable to update the setting."
            );
        } finally {
            setSavingKey(null);
        }
    };

    const renderSection = (
        sectionKey
    ) => {
        const definition =
            SECTION_DEFINITIONS[
                sectionKey
            ];

        const sectionSettings =
            definition.keys
                .map(
                    (key) =>
                        settingsMap[key]
                )
                .filter(Boolean);

        return (
            <SettingsSection
                key={sectionKey}
                title={definition.title}
                description={
                    definition.description
                }
                settings={
                    sectionSettings
                }
                values={values}
                savingKey={savingKey}
                onChange={
                    handleChange
                }
                onSave={handleSave}
            />
        );
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-stone-50">
            <AdminSidebar />
            <AdminMobileNav />

            <main className="lg:pl-64">
                <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="mb-6 sm:mb-8">
                        <p className="text-sm font-medium text-emerald-700">
                            Administration
                        </p>

                        <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                            Settings
                        </h1>

                        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-stone-600 sm:text-base">
                            Manage the general
                            configuration used
                            by BAJIM Blossom.
                            Changes to
                            contribution
                            defaults apply to
                            future cycles and
                            do not alter
                            historical
                            records.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 sm:mb-6"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="mb-5 break-words rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700 sm:mb-6"
                        >
                            {success}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-5 sm:space-y-6">
                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-56 animate-pulse rounded-2xl bg-stone-200 sm:h-64"
                                    />
                                )
                            )}
                        </div>
                    ) : settings.length ===
                      0 ? (
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-10 text-center shadow-sm sm:px-6 sm:py-12">
                            <h2 className="break-words text-lg font-semibold text-stone-900">
                                No settings found
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                                The application
                                could not
                                find any
                                configuration
                                settings.
                            </p>

                            <button
                                type="button"
                                onClick={
                                    loadSettings
                                }
                                className="mt-5 min-h-11 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5 sm:space-y-6">
                            {renderSection(
                                "organization"
                            )}

                            {renderSection(
                                "application"
                            )}

                            {renderSection(
                                "contribution"
                            )}

                            {renderSection(
                                "system"
                            )}

                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                                <h2 className="text-sm font-semibold text-amber-900">
                                    Important
                                </h2>

                                <p className="mt-1 break-words text-sm leading-6 text-amber-800">
                                    Changing a
                                    contribution
                                    default does
                                    not modify
                                    existing
                                    contribution
                                    cycles,
                                    payments,
                                    fines, or
                                    other
                                    financial
                                    history.
                                    Existing
                                    cycles retain
                                    the values
                                    they were
                                    created with.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
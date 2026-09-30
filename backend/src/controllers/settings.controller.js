import {
    getAllSettings,
    getSettingByKey,
    updateSetting
} from "../services/settings.service.js";

import {
    recordAdminActivity
} from "../services/activity-log.service.js";

function handleError(error, res, next) {
    if (error?.status) {
        return res.status(error.status).json({
            success: false,
            message: error.message
        });
    }

    return next(error);
}

/* =========================================================
   GET ALL SETTINGS
========================================================= */

export async function getAdminSettings(
    req,
    res,
    next
) {
    try {
        const settings =
            await getAllSettings();

        return res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        return handleError(
            error,
            res,
            next
        );
    }
}

/* =========================================================
   GET SINGLE SETTING
========================================================= */

export async function getAdminSetting(
    req,
    res,
    next
) {
    try {
        const { key } = req.params;

        const setting =
            await getSettingByKey(key);

        if (!setting) {
            return res.status(404).json({
                success: false,
                message:
                    "The requested setting does not exist."
            });
        }

        return res.status(200).json({
            success: true,
            data: setting
        });
    } catch (error) {
        return handleError(
            error,
            res,
            next
        );
    }
}

/* =========================================================
   UPDATE SINGLE SETTING
========================================================= */

export async function updateAdminSetting(
    req,
    res,
    next
) {
    try {
        const { key } = req.params;

        if (
            !req.body ||
            !Object.prototype.hasOwnProperty.call(
                req.body,
                "value"
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A setting value is required."
            });
        }

        const currentSetting =
            await getSettingByKey(key);

        if (!currentSetting) {
            return res.status(404).json({
                success: false,
                message:
                    "The requested setting does not exist."
            });
        }

        const oldValue =
            currentSetting.value;

        const updatedSetting =
            await updateSetting(
                key,
                req.body.value,
                req.auth.userId
            );

        await recordAdminActivity({
            userId: req.auth.userId,
            req,
            action: "SETTING_UPDATED",
            entityType: "SETTING",
            entityId: updatedSetting.id,
            description:
                `Administrator updated the "${key}" setting.`,
            metadata: {
                settingKey: key,
                oldValue,
                newValue: updatedSetting.value
            }
        });

        return res.status(200).json({
            success: true,
            message:
                "Setting updated successfully.",
            data: updatedSetting
        });
    } catch (error) {
        return handleError(
            error,
            res,
            next
        );
    }
}

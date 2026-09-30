import {
    listFines,
    getFineById,
    listFineContributions,
    createFine,
    updateFineStatus,
    updateFine
} from "../services/fine-management.service.js";

import {
    recordAdminActivity
} from "../services/activity-log.service.js";

function sendError(
    res,
    error,
    fallbackMessage
) {
    console.error(error);

    return res.status(400).json({
        success: false,
        message:
            error.message ||
            fallbackMessage
    });
}

export async function getFines(
    req,
    res
) {
    try {
        const result =
            await listFines({
                search:
                    req.query.search || "",
                status:
                    req.query.status || "",
                page:
                    req.query.page || 1,
                limit:
                    req.query.limit || 20
            });

        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to load fines."
        );
    }
}

export async function getFine(
    req,
    res
) {
    try {
        const fine =
            await getFineById(
                req.params.id
            );

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine not found."
            });
        }

        return res.json({
            success: true,
            fine
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to load fine."
        );
    }
}

export async function getFineContributions(
    req,
    res
) {
    try {
        const contributions =
            await listFineContributions({
                search:
                    req.query.search || "",
                limit:
                    req.query.limit || 50
            });

        return res.json({
            success: true,
            contributions
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to load contributions."
        );
    }
}

export async function postFine(
    req,
    res
) {
    try {
        const fine =
            await createFine({
                contributionId:
                    req.body.contributionId,

                amount:
                    req.body.amount,

                reason:
                    req.body.reason,

                appliedAt:
                    req.body.appliedAt,

                notes:
                    req.body.notes
            });

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "FINE_APPLIED",

            entityType:
                "FINE",

            entityId:
                fine?.id || null,

            description:
                `Applied a fine${req.body.amount ? ` of ₦${req.body.amount}` : ""}.`,

            metadata: {
                contributionId:
                    req.body.contributionId ||
                    null,

                amount:
                    req.body.amount ?? null,

                reason:
                    req.body.reason || null,

                status:
                    fine?.status ||
                    "OUTSTANDING"
            }
        });

        return res.status(201).json({
            success: true,
            message:
                "Fine applied successfully.",
            fine
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to apply fine."
        );
    }
}

export async function patchFine(
    req,
    res
) {
    try {
        const fine =
            await updateFine(
                req.params.id,
                {
                    amount:
                        req.body.amount,

                    reason:
                        req.body.reason,

                    appliedAt:
                        req.body.appliedAt,

                    notes:
                        req.body.notes
                }
            );

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "FINE_UPDATED",

            entityType:
                "FINE",

            entityId:
                fine?.id ||
                req.params.id,

            description:
                "Updated an outstanding fine.",

            metadata: {
                amount:
                    req.body.amount ??
                    null,

                reason:
                    req.body.reason ||
                    null,

                appliedAt:
                    req.body.appliedAt ||
                    null
            }
        });

        return res.json({
            success: true,
            message:
                "Fine updated successfully.",
            fine
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to update fine."
        );
    }
}

export async function patchFineStatus(
    req,
    res
) {
    try {
        const fine =
            await updateFineStatus(
                req.params.id,
                req.body.status,
                req.body.notes
            );

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "FINE_STATUS_CHANGED",

            entityType:
                "FINE",

            entityId:
                fine?.id ||
                req.params.id,

            description:
                `Changed fine status to ${req.body.status}.`,

            metadata: {
                newStatus:
                    req.body.status,

                notes:
                    req.body.notes ||
                    null
            }
        });

        return res.json({
            success: true,
            message:
                "Fine status updated successfully.",
            fine
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to update fine status."
        );
    }
}

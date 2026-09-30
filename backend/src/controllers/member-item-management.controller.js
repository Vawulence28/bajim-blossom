import {
    listMemberItems,
    getMemberItemById,
    listMembersForItems,
    createMemberItem,
    updateMemberItem,
    updateMemberItemStatus
} from "../services/member-item-management.service.js";

import {
    recordAdminActivity
} from "../services/activity-log.service.js";

function handleError(
    res,
    error,
    fallbackMessage
) {
    console.error(
        fallbackMessage,
        error
    );

    return res.status(400).json({
        success: false,
        message:
            error.message ||
            fallbackMessage
    });
}

export async function getItems(
    req,
    res
) {
    try {
        const result =
            await listMemberItems({
                search:
                    req.query.search || "",

                status:
                    req.query.status || "",

                page:
                    req.query.page || 1,

                limit:
                    req.query.limit || 20
            });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to load member items."
        );
    }
}

export async function getItem(
    req,
    res
) {
    try {
        const item =
            await getMemberItemById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            item
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to load member item."
        );
    }
}

export async function getItemMembers(
    req,
    res
) {
    try {
        const result =
            await listMembersForItems({
                search:
                    req.query.search || "",

                limit:
                    req.query.limit || 50
            });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to load members."
        );
    }
}

export async function postItem(
    req,
    res
) {
    try {
        const item =
            await createMemberItem({
                memberId:
                    req.body.memberId,

                itemName:
                    req.body.itemName,

                itemDescription:
                    req.body.itemDescription,

                quantity:
                    req.body.quantity,

                assignedAt:
                    req.body.assignedAt,

                notes:
                    req.body.notes
            });

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "ITEM_ASSIGNED",

            entityType:
                "MEMBER_ITEM",

            entityId:
                item?.id || null,

            description:
                `Assigned "${req.body.itemName}" to a member.`,

            metadata: {
                memberId:
                    req.body.memberId ||
                    null,

                itemName:
                    req.body.itemName ||
                    null,

                quantity:
                    req.body.quantity ??
                    1,

                status:
                    item?.status ||
                    "ASSIGNED"
            }
        });

        return res.status(201).json({
            success: true,
            message:
                "Member item assigned successfully.",
            item
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to assign member item."
        );
    }
}

export async function patchItem(
    req,
    res
) {
    try {
        const item =
            await updateMemberItem(
                req.params.id,
                {
                    itemName:
                        req.body.itemName,

                    itemDescription:
                        req.body.itemDescription,

                    quantity:
                        req.body.quantity,

                    assignedAt:
                        req.body.assignedAt,

                    notes:
                        req.body.notes
                }
            );

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "ITEM_UPDATED",

            entityType:
                "MEMBER_ITEM",

            entityId:
                item?.id ||
                req.params.id,

            description:
                `Updated member item "${req.body.itemName || "item"}".`,

            metadata: {
                itemName:
                    req.body.itemName ||
                    null,

                quantity:
                    req.body.quantity ??
                    null
            }
        });

        return res.status(200).json({
            success: true,
            message:
                "Member item updated successfully.",
            item
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to update member item."
        );
    }
}

export async function patchItemStatus(
    req,
    res
) {
    try {
        const item =
            await updateMemberItemStatus(
                req.params.id,
                req.body.status,
                req.body.notes
            );

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "ITEM_STATUS_CHANGED",

            entityType:
                "MEMBER_ITEM",

            entityId:
                item?.id ||
                req.params.id,

            description:
                `Changed member item status to ${req.body.status}.`,

            metadata: {
                newStatus:
                    req.body.status,

                notes:
                    req.body.notes ||
                    null
            }
        });

        return res.status(200).json({
            success: true,
            message:
                "Member item status updated successfully.",
            item
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to update member item status."
        );
    }
}

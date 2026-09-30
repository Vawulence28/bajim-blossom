import {
    findMemberProfileIdByUserId
} from "../models/contribution.model.js";

import {
    findMemberItems,
    findMemberItemSummary
} from "../models/member-item.model.js";

function formatItem(item) {
    return {
        id: item.id,
        itemName: item.item_name,
        itemDescription: item.item_description,
        quantity: Number(item.quantity || 0),
        status: item.status,
        assignedAt: item.assigned_at,
        collectedAt: item.collected_at,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at
    };
}

export async function getMemberItems(req, res, next) {
    try {
        const memberProfileId =
            await findMemberProfileIdByUserId(req.auth.userId);

        if (!memberProfileId) {
            return res.status(404).json({
                success: false,
                message: "Member profile was not found."
            });
        }

        const [summary, items] = await Promise.all([
            findMemberItemSummary(memberProfileId),
            findMemberItems(memberProfileId)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalItems:
                        Number(summary?.total_items || 0),

                    assignedItems:
                        Number(summary?.assigned_items || 0),

                    collectedItems:
                        Number(summary?.collected_items || 0),

                    cancelledItems:
                        Number(summary?.cancelled_items || 0),

                    totalQuantity:
                        Number(summary?.total_quantity || 0)
                },

                items: items.map(formatItem)
            }
        });
    } catch (error) {
        next(error);
    }
}
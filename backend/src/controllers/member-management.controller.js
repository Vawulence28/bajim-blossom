import {
    listMembers,
    getMemberById,
    updateMemberStatus
} from "../services/member-management.service.js";

export async function getMembers(req, res) {
    try {
        const {
            search = "",
            status = "",
            page = 1,
            limit = 20
        } = req.query;

        const result = await listMembers({
            search,
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            data: result.members,
            pagination: result.pagination
        });
    } catch (error) {
        console.error(
            "Admin member list error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load members."
        });
    }
}

export async function getMemberDetails(req, res) {
    try {
        const memberId = req.params.id;

        const member =
            await getMemberById(memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error(
            "Admin member details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load member details."
        });
    }
}

export async function changeMemberStatus(
    req,
    res
) {
    try {
        const memberId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message:
                    "Member status is required."
            });
        }

        const member =
            await updateMemberStatus(
                memberId,
                status
            );

        return res.status(200).json({
            success: true,
            message:
                status === "ACTIVE"
                    ? "Member approved and activated successfully."
                    : `Member status changed to ${status}.`,
            data: member
        });
    } catch (error) {
        console.error(
            "Admin member status error:",
            error
        );

        const statusCode =
            error.statusCode || 500;

        return res.status(statusCode).json({
            success: false,
            message:
                error.message ||
                "Unable to update member status."
        });
    }
}
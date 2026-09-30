import {
    findMemberStatusData,
    findGroupPaymentStatus
} from "../models/member-status.model.js";

function toNumber(value) {
    return Number(value || 0);
}

export async function getMemberStatus(req, res, next) {
    try {
        const statusData =
            await findMemberStatusData(req.auth.userId);

        if (!statusData) {
            return res.status(404).json({
                success: false,
                message: "Member profile was not found."
            });
        }

        const expectedAmount =
            toNumber(statusData.expected_amount);

        const amountPaid =
            toNumber(statusData.amount_paid);

        const outstandingFine =
            toNumber(statusData.outstanding_fine);

        const outstandingContribution =
            Math.max(
                expectedAmount - amountPaid,
                0
            );

        const groupPayment =
            await findGroupPaymentStatus(
                statusData.current_cycle_id
            );

        return res.status(200).json({
            success: true,

            data: {
                member: {
                    memberId: statusData.member_id,
                    fullName: statusData.full_name,
                    membershipStatus:
                        statusData.membership_status,
                    role: statusData.role,
                    joinedAt: statusData.joined_at
                },

                currentCycle:
                    statusData.current_cycle_id
                        ? {
                            id: statusData.current_cycle_id,
                            name: statusData.cycle_name,
                            startsAt: statusData.starts_at,
                            dueAt: statusData.due_at,
                            graceUntil:
                                statusData.grace_until,
                            contributionAmount:
                                toNumber(
                                    statusData.contribution_amount
                                ),
                            fineAmount:
                                toNumber(
                                    statusData.fine_amount
                                ),
                            status:
                                statusData.cycle_status
                        }
                        : null,

                contribution:
                    statusData.contribution_id
                        ? {
                            id:
                                statusData.contribution_id,
                            expectedAmount,
                            amountPaid,
                            outstandingContribution,
                            outstandingFine,
                            totalOutstanding:
                                outstandingContribution +
                                outstandingFine,
                            status:
                                statusData.contribution_status,
                            paidAt:
                                statusData.paid_at
                        }
                        : null,

                groupPayment:
                    groupPayment
                        ? {
                            totalMembers:
                                Number(
                                    groupPayment.total_members
                                ),
                            paidMembers:
                                Number(
                                    groupPayment.paid_members
                                ),
                            unpaidMembers:
                                Number(
                                    groupPayment.unpaid_members
                                )
                        }
                        : null
            }
        });
    } catch (error) {
        next(error);
    }
}
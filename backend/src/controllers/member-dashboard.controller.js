import {
    findMemberDashboardData,
    findRecentMemberContributions,
    findLatestPublishedAnnouncement
} from "../models/member-dashboard.model.js";

function toNumber(value) {
    return Number(value || 0);
}

export async function getMemberDashboard(
    req,
    res,
    next
) {
    try {
        const dashboard =
            await findMemberDashboardData(
                req.auth.userId
            );

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: "Member profile was not found."
            });
        }

        const expectedAmount =
            toNumber(dashboard.expected_amount);

        const amountPaid =
            toNumber(dashboard.amount_paid);

        const outstandingFine =
            toNumber(dashboard.outstanding_fine);

        const outstandingContribution =
            Math.max(
                expectedAmount - amountPaid,
                0
            );

        const [
            recentContributions,
            latestAnnouncement
        ] = await Promise.all([
            findRecentMemberContributions(
                dashboard.profile_id
            ),
            findLatestPublishedAnnouncement()
        ]);

        return res.status(200).json({
            success: true,

            data: {
                member: {
                    memberId: dashboard.member_id,
                    fullName: dashboard.full_name,
                    status: dashboard.status,
                    role: dashboard.role
                },

                currentCycle:
                    dashboard.cycle_id
                        ? {
                            id: dashboard.cycle_id,
                            name: dashboard.cycle_name,
                            startsAt: dashboard.starts_at,
                            dueAt: dashboard.due_at,
                            graceUntil:
                                dashboard.grace_until,
                            contributionAmount:
                                toNumber(
                                    dashboard.contribution_amount
                                ),
                            fineAmount:
                                toNumber(
                                    dashboard.fine_amount
                                ),
                            status:
                                dashboard.cycle_status
                        }
                        : null,

                currentContribution:
                    dashboard.contribution_id
                        ? {
                            id:
                                dashboard.contribution_id,
                            expectedAmount,
                            amountPaid,
                            outstandingContribution,
                            outstandingFine,
                            totalOutstanding:
                                outstandingContribution +
                                outstandingFine,
                            status:
                                dashboard.contribution_status,
                            paidAt:
                                dashboard.paid_at
                        }
                        : null,

                recentContributions:
                    recentContributions.map(
                        (contribution) => ({
                            id: contribution.id,
                            cycleName:
                                contribution.cycle_name,
                            expectedAmount:
                                toNumber(
                                    contribution.expected_amount
                                ),
                            amountPaid:
                                toNumber(
                                    contribution.amount_paid
                                ),
                            outstandingAmount:
                                Math.max(
                                    toNumber(
                                        contribution.expected_amount
                                    ) -
                                    toNumber(
                                        contribution.amount_paid
                                    ),
                                    0
                                ),
                            status:
                                contribution.status,
                            dueAt:
                                contribution.due_at,
                            paidAt:
                                contribution.paid_at
                        })
                    ),

                latestAnnouncement:
                    latestAnnouncement
                        ? {
                            id: latestAnnouncement.id,
                            title:
                                latestAnnouncement.title,
                            content:
                                latestAnnouncement.content,
                            category:
                                latestAnnouncement.category,
                            publishedAt:
                                latestAnnouncement.published_at
                        }
                        : null
            }
        });
    } catch (error) {
        next(error);
    }
}
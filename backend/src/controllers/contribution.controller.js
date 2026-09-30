import {
    findMemberProfileIdByUserId,
    findMemberContributionSummary,
    findCurrentMemberContribution,
    findMemberContributionHistory
} from "../models/contribution.model.js";

function toNumber(value) {
    return Number(value || 0);
}

function formatPayment(payment) {
    return {
        id: payment.id,
        amount: toNumber(payment.amount),
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        paymentReference: payment.paymentReference,
        paidAt: payment.paidAt
    };
}

function formatFine(fine) {
    return {
        id: fine.id,
        amount: toNumber(fine.amount),
        reason: fine.reason,
        status: fine.status,
        appliedAt: fine.appliedAt,
        paidAt: fine.paidAt
    };
}

function formatContribution(contribution) {
    const expectedAmount = toNumber(contribution.expected_amount);
    const amountPaid = toNumber(contribution.amount_paid);
    const outstandingFine = toNumber(contribution.outstanding_fine);

    const outstandingContribution = Math.max(
        expectedAmount - amountPaid,
        0
    );

    return {
        id: contribution.id,
        cycleId: contribution.cycle_id,

        cycle: {
            name: contribution.cycle_name,
            startsAt: contribution.starts_at,
            dueAt: contribution.due_at,
            graceUntil: contribution.grace_until,
            contributionAmount: toNumber(
                contribution.contribution_amount
            ),
            fineAmount: toNumber(contribution.fine_amount),
            status: contribution.cycle_status
        },

        expectedAmount,

        amountPaid,

        outstandingContribution,

        outstandingFine,

        totalOutstanding:
            outstandingContribution + outstandingFine,

        status: contribution.status,

        paidAt: contribution.paid_at,

        notes: contribution.notes,

        createdAt: contribution.created_at,

        payments: Array.isArray(contribution.payments)
            ? contribution.payments.map(formatPayment)
            : [],

        fines: Array.isArray(contribution.fines)
            ? contribution.fines.map(formatFine)
            : []
    };
}

export async function getMemberContributions(req, res, next) {
    try {
        const memberProfileId =
            await findMemberProfileIdByUserId(req.auth.userId);

        if (!memberProfileId) {
            return res.status(404).json({
                success: false,
                message: "Member profile was not found."
            });
        }

        const [
            summary,
            currentContribution,
            history
        ] = await Promise.all([
            findMemberContributionSummary(memberProfileId),
            findCurrentMemberContribution(memberProfileId),
            findMemberContributionHistory(memberProfileId)
        ]);

        const formattedHistory = history.map(
            formatContribution
        );

        const formattedCurrentContribution =
            currentContribution
                ? formatContribution(currentContribution)
                : null;

        return res.status(200).json({
            success: true,

            data: {
                summary: {
                    totalContributions:
                        Number(summary?.total_contributions || 0),

                    paidContributions:
                        Number(summary?.paid_contributions || 0),

                    outstandingContributions:
                        Number(
                            summary?.outstanding_contributions || 0
                        ),

                    totalExpectedAmount:
                        toNumber(summary?.total_expected_amount),

                    totalPaidAmount:
                        toNumber(summary?.total_paid_amount),

                    outstandingFines:
                        toNumber(summary?.outstanding_fines),

                    totalOutstanding:
                        Math.max(
                            toNumber(summary?.total_expected_amount) -
                            toNumber(summary?.total_paid_amount),
                            0
                        ) +
                        toNumber(summary?.outstanding_fines)
                },

                currentContribution:
                    formattedCurrentContribution,

                history: formattedHistory
            }
        });
    } catch (error) {
        next(error);
    }
}
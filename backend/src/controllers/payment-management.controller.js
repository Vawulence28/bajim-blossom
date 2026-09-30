import {
    listPayments,
    getPaymentById,
    listPaymentContributions,
    createPayment,
    updatePaymentStatus
} from "../services/payment-management.service.js";

import {
    recordAdminActivity
} from "../services/activity-log.service.js";

/* =========================================================
   GET PAYMENTS
========================================================= */

export async function getPayments(
    req,
    res,
    next
) {
    try {
        const result =
            await listPayments({
                search:
                    req.query.search || "",
                status:
                    req.query.status || "",
                method:
                    req.query.method || "",
                page:
                    req.query.page || 1,
                limit:
                    req.query.limit || 20
            });

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET SINGLE PAYMENT
========================================================= */

export async function getPaymentDetails(
    req,
    res,
    next
) {
    try {
        const payment =
            await getPaymentById(
                req.params.id
            );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found."
            });
        }

        return res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   GET CONTRIBUTIONS AVAILABLE FOR PAYMENT
========================================================= */

export async function getPaymentContributions(
    req,
    res,
    next
) {
    try {
        const contributions =
            await listPaymentContributions({
                search:
                    req.query.search || "",
                limit:
                    req.query.limit || 50
            });

        return res.json({
            success: true,
            data: contributions
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   CREATE PAYMENT
========================================================= */

export async function recordPayment(
    req,
    res,
    next
) {
    try {
        const {
            contributionId,
            amount,
            paymentMethod,
            paymentReference,
            paidAt,
            notes
        } = req.body;

        const payment =
            await createPayment({
                contributionId,
                amount,
                paymentMethod,
                paymentReference,
                paidAt,
                notes,
                recordedBy:
                    req.auth.userId
            });

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "PAYMENT_RECORDED",

            entityType:
                "PAYMENT",

            entityId:
                payment?.id || null,

            description:
                `Recorded a payment${amount ? ` of ₦${amount}` : ""}.`,

            metadata: {
                contributionId:
                    contributionId || null,

                amount:
                    amount ?? null,

                paymentMethod:
                    paymentMethod || null,

                paymentReference:
                    paymentReference || null,

                paymentStatus:
                    payment?.payment_status ||
                    "VERIFIED"
            }
        });

        return res.status(201).json({
            success: true,
            message:
                "Payment recorded successfully.",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

export async function changePaymentStatus(
    req,
    res,
    next
) {
    try {
        const {
            status
        } = req.body;

        const payment =
            await updatePaymentStatus(
                req.params.id,
                status
            );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found."
            });
        }

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "PAYMENT_STATUS_CHANGED",

            entityType:
                "PAYMENT",

            entityId:
                payment.id,

            description:
                `Changed payment status to ${status}.`,

            metadata: {
                paymentId:
                    payment.id,

                contributionId:
                    payment.contribution_id ||
                    null,

                newStatus:
                    status,

                resultingPaymentStatus:
                    payment.payment_status ||
                    status
            }
        });

        return res.json({
            success: true,
            message:
                "Payment status updated successfully.",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

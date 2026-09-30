import express from "express";

import {
    requireAuthentication,
    requireAdmin
} from "../middleware/auth.middleware.js";

import {
    getPayments,
    getPaymentDetails,
    getPaymentContributions,
    recordPayment,
    changePaymentStatus
} from "../controllers/payment-management.controller.js";

const router =
    express.Router();

router.use(
    requireAuthentication,
    requireAdmin
);

/*
 * Important:
 * This route must come before /:id.
 */
router.get(
    "/contributions",
    getPaymentContributions
);

router.get(
    "/",
    getPayments
);

router.get(
    "/:id",
    getPaymentDetails
);

router.post(
    "/",
    recordPayment
);

router.patch(
    "/:id/status",
    changePaymentStatus
);

export default router;
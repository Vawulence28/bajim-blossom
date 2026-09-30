import express from "express";

import {
    getContributionsReport,
    getPaymentsReport,
    getFinesReport,
    getMembersForReports,
    getMemberStatementReport
} from "../controllers/report.controller.js";

import {
    requireAuthentication,
    requireAdmin
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(
    requireAuthentication,
    requireAdmin
);

/*
 * Members must be registered before
 * the dynamic /member-statement/:id
 * route.
 */
router.get(
    "/members",
    getMembersForReports
);

router.get(
    "/contributions",
    getContributionsReport
);

router.get(
    "/payments",
    getPaymentsReport
);

router.get(
    "/fines",
    getFinesReport
);

router.get(
    "/member-statement/:id",
    getMemberStatementReport
);

export default router;

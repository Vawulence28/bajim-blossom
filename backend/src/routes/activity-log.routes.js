import express from "express";

import {
    requireAuthentication,
    requireAdmin
} from "../middleware/auth.middleware.js";

import {
    getActivityLogs,
    getActivityLogDetails
} from "../controllers/activity-log.controller.js";

const router =
    express.Router();

router.use(
    requireAuthentication
);

router.use(
    requireAdmin
);

router.get(
    "/",
    getActivityLogs
);

router.get(
    "/:id",
    getActivityLogDetails
);

export default router;

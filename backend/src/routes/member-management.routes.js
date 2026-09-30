import express from "express";

import {
    getMembers,
    getMemberDetails,
    changeMemberStatus
} from "../controllers/member-management.controller.js";

import {
    requireAuthentication,
    requireAdmin
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(
    requireAuthentication,
    requireAdmin
);

router.get(
    "/",
    getMembers
);

router.get(
    "/:id",
    getMemberDetails
);

router.patch(
    "/:id/status",
    changeMemberStatus
);

export default router;
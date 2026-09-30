import express from "express";

import {
    requireAuthentication,
    requireAdmin
} from "../middleware/auth.middleware.js";

import {
    getCycles,
    getCycleDetails,
    createCycle,
    updateCycle,
    changeCycleStatus
} from "../controllers/contribution-cycle.controller.js";

const router =
    express.Router();

router.use(
    requireAuthentication,
    requireAdmin
);

router.get(
    "/",
    getCycles
);

router.get(
    "/:id",
    getCycleDetails
);

router.post(
    "/",
    createCycle
);

router.patch(
    "/:id",
    updateCycle
);

router.patch(
    "/:id/status",
    changeCycleStatus
);

export default router;

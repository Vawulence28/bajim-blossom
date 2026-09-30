import express from "express";

import {
    getFines,
    getFine,
    getFineContributions,
    postFine,
    patchFine,
    patchFineStatus
} from "../controllers/fine-management.controller.js";

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
    getFines
);

router.get(
    "/contributions",
    getFineContributions
);

router.get(
    "/:id",
    getFine
);

router.post(
    "/",
    postFine
);

router.patch(
    "/:id",
    patchFine
);

router.patch(
    "/:id/status",
    patchFineStatus
);

export default router;
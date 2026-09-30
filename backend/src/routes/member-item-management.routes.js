import express from "express";

import {
    getItems,
    getItem,
    getItemMembers,
    postItem,
    patchItem,
    patchItemStatus
} from "../controllers/member-item-management.controller.js";

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
    getItems
);

router.get(
    "/members",
    getItemMembers
);

router.get(
    "/:id",
    getItem
);

router.post(
    "/",
    postItem
);

router.patch(
    "/:id",
    patchItem
);

router.patch(
    "/:id/status",
    patchItemStatus
);

export default router;
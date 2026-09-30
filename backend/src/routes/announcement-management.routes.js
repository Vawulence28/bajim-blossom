import express from "express";

import {
    getAnnouncements,
    getAnnouncement,
    postAnnouncement,
    patchAnnouncement,
    patchAnnouncementStatus
} from "../controllers/announcement-management.controller.js";

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
    getAnnouncements
);

router.get(
    "/:id",
    getAnnouncement
);

router.post(
    "/",
    postAnnouncement
);

router.patch(
    "/:id",
    patchAnnouncement
);

router.patch(
    "/:id/status",
    patchAnnouncementStatus
);

export default router;

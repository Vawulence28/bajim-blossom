import express from "express";

import {
    getAdminSettings,
    getAdminSetting,
    updateAdminSetting
} from "../controllers/settings.controller.js";

import {
    requireAuthentication
} from "../middleware/auth.middleware.js";

import {
    requireAdmin
} from "../middleware/authorization.middleware.js";

const router = express.Router();

router.use(requireAuthentication);

router.use(requireAdmin);

router.get(
    "/",
    getAdminSettings
);

router.get(
    "/:key",
    getAdminSetting
);

router.patch(
    "/:key",
    updateAdminSetting
);

export default router;

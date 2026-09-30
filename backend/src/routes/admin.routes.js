import express from "express";

import {
    getAdminDashboard,
    getAdminMe
} from "../controllers/admin.controller.js";

import { requireAuthentication } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/authorization.middleware.js";

const router = express.Router();

router.use(requireAuthentication);
router.use(requireAdmin);

router.get("/me", getAdminMe);
router.get("/dashboard", getAdminDashboard);

export default router;
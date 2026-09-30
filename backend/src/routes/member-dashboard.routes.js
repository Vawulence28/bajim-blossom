import express from "express";

import {
    getMemberDashboard
} from "../controllers/member-dashboard.controller.js";

import {
    requireAuthentication
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuthentication);

router.get("/", getMemberDashboard);

export default router;
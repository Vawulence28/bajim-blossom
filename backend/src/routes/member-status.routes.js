import express from "express";

import {
    getMemberStatus
} from "../controllers/member-status.controller.js";

import {
    requireAuthentication
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuthentication);

router.get("/", getMemberStatus);

export default router;
import express from "express";

import {
    getMemberProfile,
    updateMemberProfile
} from "../controllers/member.controller.js";

import { requireAuthentication } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuthentication);

router.get("/profile", getMemberProfile);

router.patch("/profile", updateMemberProfile);

export default router;
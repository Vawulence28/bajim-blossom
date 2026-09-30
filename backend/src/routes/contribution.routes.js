import express from "express";

import {
    getMemberContributions
} from "../controllers/contribution.controller.js";

import {
    requireAuthentication
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuthentication);

router.get("/", getMemberContributions);

export default router;
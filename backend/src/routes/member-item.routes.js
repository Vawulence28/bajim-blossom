import express from "express";

import {
    getMemberItems
} from "../controllers/member-item.controller.js";

import {
    requireAuthentication
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuthentication);

router.get("/", getMemberItems);

export default router;
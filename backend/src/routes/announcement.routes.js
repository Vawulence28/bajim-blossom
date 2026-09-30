import express from "express";

import {
    getMemberAnnouncements
} from "../controllers/announcement.controller.js";

import {
    requireAuthentication
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuthentication);

router.get("/", getMemberAnnouncements);

export default router;
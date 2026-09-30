import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { testDatabaseConnection } from "./config/database.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import memberRoutes from "./routes/member.routes.js";
import contributionRoutes from "./routes/contribution.routes.js";
import memberItemRoutes from "./routes/member-item.routes.js";
import memberStatusRoutes from "./routes/member-status.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import memberDashboardRoutes from "./routes/member-dashboard.routes.js";
import memberManagementRoutes from "./routes/member-management.routes.js";
import contributionCycleRoutes from "./routes/contribution-cycle.routes.js";
import paymentManagementRoutes from "./routes/payment-management.routes.js";
import fineManagementRoutes from "./routes/fine-management.routes.js";
import memberItemManagementRoutes from "./routes/member-item-management.routes.js";
import announcementManagementRoutes from "./routes/announcement-management.routes.js";
import reportRoutes from "./routes/report.routes.js";
import activityLogRoutes from "./routes/activity-log.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import contactRoutes from "./routes/contact.routes.js";


import {
    verifyRequestOrigin
} from "./middleware/csrf.middleware.js";

import {
    isAppError
} from "./utils/errors.js";

dotenv.config();

const app = express();

const PORT =
    process.env.PORT || 5000;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:3000";



app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

app.use(cookieParser());


const globalLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 300,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "Too many requests. Please try again later."
        }
    });

app.use(globalLimiter);


const authLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 20,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "Too many authentication attempts. Please try again later."
        }
    });


app.use(
    verifyRequestOrigin
);


app.get(
    "/api",
    (req, res) => {
        res.status(200).json({
            success: true,
            message:
                "Welcome to the BAJIM BLOSSOM API."
        });
    }
);


app.get(
    "/api/health",
    async (req, res) => {
        try {
            const database =
                await testDatabaseConnection();

            res.status(200).json({
                success: true,
                message:
                    "BAJIM BLOSSOM API is running.",
                environment:
                    process.env.NODE_ENV ||
                    "development",
                database:
                    "connected",
                databaseTime:
                    database.current_time,
                timestamp:
                    new Date().toISOString()
            });
        } catch (error) {
            console.error(
                "Database health check failed:",
                error
            );

            res.status(503).json({
                success: false,
                message:
                    "API is running, but the database is unavailable.",
                database:
                    "disconnected"
            });
        }
    }
);


app.use(
    "/api/auth",
    authLimiter,
    authRoutes
);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/members", memberManagementRoutes);
app.use("/api/admin/cycles", contributionCycleRoutes);
app.use("/api/admin/payments", paymentManagementRoutes);
app.use("/api/admin/fines", fineManagementRoutes);
app.use("/api/admin/items", memberItemManagementRoutes);
app.use("/api/admin/announcements", announcementManagementRoutes);
app.use("/api/admin/reports", reportRoutes);
app.use("/api/admin/activity", activityLogRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/member/contributions", contributionRoutes);
app.use("/api/member/items", memberItemRoutes);
app.use("/api/member/status", memberStatusRoutes);
app.use("/api/member/announcements", announcementRoutes);
app.use("/api/member/dashboard", memberDashboardRoutes);
app.use("/api/contact", contactRoutes);


app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message:
                "The requested API endpoint was not found."
        });
    }
);


app.use(
    (
        err,
        req,
        res,
        next
    ) => {
        console.error(
            "Unhandled server error:",
            err
        );

        if (
            isAppError(err)
        ) {
            return res.status(
                err.statusCode
            ).json({
                success: false,
                message:
                    err.message,
                code:
                    err.code
            });
        }


        if (
            err.code ===
            "23505"
        ) {
            return res.status(
                409
            ).json({
                success: false,
                message:
                    "A record with the supplied information already exists."
            });
        }


        if (
            err.code ===
            "23503"
        ) {
            return res.status(
                400
            ).json({
                success: false,
                message:
                    "The requested operation references data that does not exist."
            });
        }

        return res.status(
            err.status || 500
        ).json({
            success: false,
            message:
                "An unexpected server error occurred."
        });
    }
);


app.listen(
    PORT,
    () => {
        console.log(
            "=============================================="
        );

        console.log(
            " BAJIM BLOSSOM API"
        );

        console.log(
            "=============================================="
        );

        console.log(
            ` Environment: ${
                process.env.NODE_ENV ||
                "development"
            }`
        );

        console.log(
            ` Server: http://localhost:${PORT}`
        );

        console.log(
            ` Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            ` Auth: http://localhost:${PORT}/api/auth`
        );

        console.log(
            "=============================================="
        );
    }
);
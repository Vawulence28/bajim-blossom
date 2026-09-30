import express from "express";

import {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

import {
    requireAuthentication
} from "../middleware/auth.middleware.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Registration
|--------------------------------------------------------------------------
*/

router.post(
    "/register",
    register
);


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

router.post(
    "/login",
    login
);


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

router.post(
    "/logout",
    logout
);


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    requireAuthentication,
    getCurrentUser
);


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

router.post(
    "/forgot-password",
    forgotPassword
);


/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

router.post(
    "/reset-password",
    resetPassword
);


export default router;
import {
    registerMember,
    loginUser,
    logoutUserSession,
    createPasswordResetRequest,
    resetUserPassword,
    sanitizeUser
} from "../services/auth.service.js";

import {
    validateRegistrationInput,
    validateLoginInput,
    validateForgotPasswordInput,
    validateResetPasswordInput
} from "../validators/auth.validators.js";

import {
    setSessionCookie,
    clearSessionCookie,
    SESSION_COOKIE_NAME
} from "../utils/cookies.js";

import {
    getClientIp,
    getUserAgent
} from "../utils/auth.utils.js";

import {
    isAppError
} from "../utils/errors.js";

export async function register(
    req,
    res,
    next
) {
    try {
        const validation =
            validateRegistrationInput(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Please correct the highlighted fields.",
                errors: validation.errors
            });
        }

        const result =
            await registerMember(
                validation.data
            );

        return res.status(201).json({
            success: true,
            message:
                "Your membership application has been submitted successfully. Please wait for administrative approval.",
            data: {
                userId: result.userId,
                profile: {
                    id: result.profile.id,
                    fullName:
                        result.profile.full_name,
                    email:
                        result.profile.email,
                    phone:
                        result.profile.phone,
                    role:
                        result.profile.role,
                    status:
                        result.profile.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function login(
    req,
    res,
    next
) {
    try {
        const validation =
            validateLoginInput(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide valid login details.",
                errors: validation.errors
            });
        }

        const result =
            await loginUser({
                ...validation.data,
                ipAddress:
                    getClientIp(req),
                userAgent:
                    getUserAgent(req)
            });

        setSessionCookie(
            res,
            result.token
        );

        return res.status(200).json({
            success: true,
            message:
                "Login successful.",
            data: {
                user: result.user
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function logout(
    req,
    res,
    next
) {
    try {
        const token =
            req.cookies?.[
                SESSION_COOKIE_NAME
            ];

        await logoutUserSession(token);

        clearSessionCookie(res);

        return res.status(200).json({
            success: true,
            message:
                "You have been logged out successfully."
        });
    } catch (error) {
        next(error);
    }
}

export async function getCurrentUser(
    req,
    res
) {
    return res.status(200).json({
        success: true,
        data: {
            user: {
                id: req.auth.userId,
                memberId:
                    req.auth.memberId || null,
                fullName:
                    req.auth.fullName,
                phone:
                    req.auth.phone,
                email:
                    req.auth.email,
                address:
                    req.auth.address || null,
                emergencyContact:
                    req.auth.emergencyContact ||
                    null,
                role:
                    req.auth.role,
                status:
                    req.auth.status
            }
        }
    });
}


export async function forgotPassword(
    req,
    res,
    next
) {
    try {
        const validation =
            validateForgotPasswordInput(
                req.body
            );

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
                errors:
                    validation.errors
            });
        }

        const result =
            await createPasswordResetRequest(
                validation.data.email
            );

        const response = {
            success: true,

            message:
                "If an account exists with that email address, password reset instructions will be provided."
        };

        /*
         * Development-only testing support.
         * Never expose reset tokens in production.
         */
        if (
            process.env.NODE_ENV ===
                "development" &&
            result.resetToken
        ) {
            response.development = {
                resetToken:
                    result.resetToken,

                resetUrl:
                    result.resetUrl
            };
        }

        return res.status(200).json(
            response
        );
    } catch (error) {
        next(error);
    }
}


export async function resetPassword(
    req,
    res,
    next
) {
    try {
        const validation =
            validateResetPasswordInput(
                req.body
            );

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Please correct the password reset information.",
                errors: validation.errors
            });
        }

        await resetUserPassword(
            validation.data
        );

        return res.status(200).json({
            success: true,
            message:
                "Your password has been reset successfully. Please log in again."
        });
    } catch (error) {
        next(error);
    }
}
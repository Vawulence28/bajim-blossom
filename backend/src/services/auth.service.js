import crypto from "crypto";

import pool from "../config/database.js";

import {
    createUser,
    findUserByEmail,
    updateLastLogin
} from "../models/user.model.js";

import {
    sendPasswordResetEmail
} from "./email.service.js";

import {
    createProfile
} from "../models/profile.model.js";

import {
    createUserSession,
    logoutUser
} from "./session.service.js";

import {
    hashPassword,
    comparePassword
} from "./password.service.js";

import {
    generateSecureToken,
    hashToken,
    normalizeEmail
} from "../utils/auth.utils.js";

import { AppError } from "../utils/errors.js";


/*
|--------------------------------------------------------------------------
| Register Member
|--------------------------------------------------------------------------
*/

export async function registerMember({
    fullName,
    phone,
    email,
    password,
    address,
    emergencyContact
}) {
    const normalizedEmail =
        normalizeEmail(email);

    const existingUser =
        await findUserByEmail(normalizedEmail);

    if (existingUser) {
        throw new AppError(
            "An account already exists with this email address.",
            409,
            "EMAIL_ALREADY_EXISTS"
        );
    }

    const client =
        await pool.connect();

    try {
        await client.query("BEGIN");

        const passwordHash =
            await hashPassword(password);

        const user = await createUser(client, {
            passwordHash
        });

        const profile =
            await createProfile(client, {
                userId: user.id,
                fullName,
                phone,
                email: normalizedEmail,
                address,
                emergencyContact
            });

        await client.query("COMMIT");

        return {
            userId: user.id,
            profile
        };
    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            throw new AppError(
                "An account already exists with some of the information provided.",
                409,
                "DUPLICATE_ACCOUNT_DATA"
            );
        }

        throw error;
    } finally {
        client.release();
    }
}


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export async function loginUser({
    email,
    password,
    ipAddress,
    userAgent
}) {
    const normalizedEmail =
        normalizeEmail(email);

    const user =
        await findUserByEmail(normalizedEmail);

    if (!user) {
        throw new AppError(
            "Invalid email or password.",
            401,
            "INVALID_CREDENTIALS"
        );
    }

    const passwordMatches =
        await comparePassword(
            password,
            user.password_hash
        );

    if (!passwordMatches) {
        throw new AppError(
            "Invalid email or password.",
            401,
            "INVALID_CREDENTIALS"
        );
    }

    if (!user.is_active) {
        throw new AppError(
            "This account is currently inactive.",
            403,
            "ACCOUNT_INACTIVE"
        );
    }

    if (
        user.role === "MEMBER" &&
        user.status !== "ACTIVE"
    ) {
        if (user.status === "PENDING_APPROVAL") {
            throw new AppError(
                "Your membership application is still awaiting approval.",
                403,
                "PENDING_APPROVAL"
            );
        }

        if (user.status === "REJECTED") {
            throw new AppError(
                "Your membership application was not approved.",
                403,
                "APPLICATION_REJECTED"
            );
        }

        throw new AppError(
            "Your account is not currently active.",
            403,
            "ACCOUNT_NOT_ACTIVE"
        );
    }

    const client =
        await pool.connect();

    try {
        await client.query("BEGIN");

        const session =
            await createUserSession(client, {
                userId: user.id,
                ipAddress,
                userAgent
            });

        await client.query(
            `
            UPDATE baj_users
            SET last_login_at = NOW()
            WHERE id = $1
            `,
            [user.id]
        );

        await client.query("COMMIT");

        return {
            token: session.rawToken,
            user: sanitizeUser(user)
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export function sanitizeUser(user) {
    return {
        id: user.id,
        memberId: user.member_id || null,
        fullName: user.full_name,
        phone: user.phone,
        email: user.email,
        address: user.address || null,
        emergencyContact:
            user.emergency_contact || null,
        role: user.role,
        status: user.status,
        joinedAt: user.joined_at || null
    };
}


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export async function logoutUserSession(
    rawToken
) {
    await logoutUser(rawToken);
}


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

export async function createPasswordResetRequest(
    email
) {
    const normalizedEmail =
        normalizeEmail(email);

    const user =
        await findUserByEmail(
            normalizedEmail
        );

    /*
     * We deliberately return the same external
     * result whether the account exists or not.
     */
    if (!user) {
        return {
            accepted: true
        };
    }

    const rawToken =
        generateSecureToken(48);

    const tokenHash =
        hashToken(rawToken);

    const expiresAt = new Date(
        Date.now() + 60 * 60 * 1000
    );

    /*
     * Invalidate existing unused reset tokens
     * for this user before creating a new one.
     */
    await pool.query(
        `
        UPDATE baj_password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = $1
        AND used_at IS NULL
        `,
        [user.id]
    );

    await pool.query(
        `
        INSERT INTO baj_password_reset_tokens (
            user_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        `,
        [
            user.id,
            tokenHash,
            expiresAt
        ]
    );

    const frontendUrl =
        process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw new Error(
            "FRONTEND_URL is not configured."
        );
    }

    const resetUrl =
        `${frontendUrl.replace(/\/$/, "")}` +
        `/reset-password/${encodeURIComponent(
            rawToken
        )}`;

    /*
     * Development mode keeps the token available
     * in the API response for local testing.
     *
     * Production sends the reset link by email
     * and never exposes the raw token through the API.
     */
    if (
        process.env.NODE_ENV ===
        "development"
    ) {
        return {
            accepted: true,
            resetToken: rawToken,
            resetUrl
        };
    }

    try {
        await sendPasswordResetEmail({
            email: user.email,
            fullName: user.full_name,
            resetUrl
        });
    } catch (error) {
        /*
         * If email delivery fails, invalidate the token
         * so an undelivered reset link cannot remain usable.
         */
        await pool.query(
            `
            UPDATE baj_password_reset_tokens
            SET used_at = NOW()
            WHERE token_hash = $1
            AND used_at IS NULL
            `,
            [tokenHash]
        );

        console.error(
            "Password reset email delivery failed:",
            error
        );

        throw new AppError(
            "Password reset could not be started. Please try again later.",
            500,
            "PASSWORD_RESET_EMAIL_FAILED"
        );
    }

    return {
        accepted: true
    };
}


/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

export async function resetUserPassword({
    token,
    password
}) {
    const tokenHash =
        hashToken(token);

    const client =
        await pool.connect();

    try {
        await client.query("BEGIN");

        const tokenResult =
            await client.query(
                `
                SELECT
                    id,
                    user_id,
                    expires_at,
                    used_at
                FROM baj_password_reset_tokens
                WHERE token_hash = $1
                AND used_at IS NULL
                AND expires_at > NOW()
                LIMIT 1
                `,
                [tokenHash]
            );

        const resetRecord =
            tokenResult.rows[0];

        if (!resetRecord) {
            throw new AppError(
                "This password reset link is invalid or has expired.",
                400,
                "INVALID_RESET_TOKEN"
            );
        }

        const passwordHash =
            await hashPassword(password);

        await client.query(
            `
            UPDATE baj_users
            SET
                password_hash = $1,
                updated_at = NOW()
            WHERE id = $2
            `,
            [
                passwordHash,
                resetRecord.user_id
            ]
        );

        await client.query(
            `
            UPDATE baj_password_reset_tokens
            SET used_at = NOW()
            WHERE id = $1
            `,
            [resetRecord.id]
        );

        /*
        Revoke all existing sessions after password reset.
        This forces previously authenticated devices to log in again.
        */

        await client.query(
            `
            UPDATE baj_sessions
            SET revoked_at = NOW()
            WHERE user_id = $1
            AND revoked_at IS NULL
            `,
            [resetRecord.user_id]
        );

        await client.query("COMMIT");

        return {
            success: true
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
import {
    isValidEmail,
    normalizeEmail,
    normalizeName,
    normalizePhone
} from "../utils/auth.utils.js";

export function validateRegistrationInput(body) {
    const fullName = normalizeName(body.fullName || "");
    const phone = normalizePhone(body.phone || "");
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    const address = body.address
        ? body.address.trim()
        : null;

    const emergencyContact = body.emergencyContact
        ? body.emergencyContact.trim()
        : null;

    const errors = {};

    if (!fullName) {
        errors.fullName = "Full name is required.";
    } else if (fullName.length < 2) {
        errors.fullName =
            "Full name must contain at least 2 characters.";
    }

    if (!phone) {
        errors.phone = "Phone number is required.";
    } else if (phone.length < 7 || phone.length > 30) {
        errors.phone =
            "Please provide a valid phone number.";
    }

    if (!email) {
        errors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
        errors.email =
            "Please provide a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password =
            "Password must contain at least 8 characters.";
    }

    if (password !== confirmPassword) {
        errors.confirmPassword =
            "Passwords do not match.";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        data: {
            fullName,
            phone,
            email,
            password,
            address,
            emergencyContact
        }
    };
}

export function validateLoginInput(body) {
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";

    const errors = {};

    if (!email) {
        errors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
        errors.email =
            "Please provide a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        data: {
            email,
            password
        }
    };
}

export function validateForgotPasswordInput(body) {
    const email = normalizeEmail(body.email || "");

    const errors = {};

    if (!email) {
        errors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
        errors.email =
            "Please provide a valid email address.";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        data: {
            email
        }
    };
}

export function validateResetPasswordInput(body) {
    const token = (body.token || "").trim();
    const password = body.password || "";
    const confirmPassword =
        body.confirmPassword || "";

    const errors = {};

    if (!token) {
        errors.token =
            "Password reset token is required.";
    }

    if (!password) {
        errors.password =
            "New password is required.";
    } else if (password.length < 8) {
        errors.password =
            "Password must contain at least 8 characters.";
    }

    if (password !== confirmPassword) {
        errors.confirmPassword =
            "Passwords do not match.";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        data: {
            token,
            password
        }
    };
}
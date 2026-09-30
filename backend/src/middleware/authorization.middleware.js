export function requireRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.auth) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication is required."
            });
        }

        if (
            !allowedRoles.includes(req.auth.role)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You don't have permission to perform this action."
            });
        }

        next();
    };
}

export function requireAdmin(req, res, next) {
    return requireRoles(
        "ADMIN",
        "SUPER_ADMIN"
    )(req, res, next);
}

export function requireSuperAdmin(
    req,
    res,
    next
) {
    return requireRoles(
        "SUPER_ADMIN"
    )(req, res, next);
}
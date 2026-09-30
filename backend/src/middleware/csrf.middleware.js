const SAFE_METHODS = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);

export function verifyRequestOrigin(
    req,
    res,
    next
) {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const configuredOrigin =
        process.env.FRONTEND_URL;

    const requestOrigin =
        req.headers.origin;

    if (
        configuredOrigin &&
        requestOrigin &&
        requestOrigin !== configuredOrigin
    ) {
        return res.status(403).json({
            success: false,
            message:
                "This request origin is not permitted."
        });
    }

    next();
}
const isProduction = process.env.NODE_ENV === "production";

export const SESSION_COOKIE_NAME = "baj_session";

export const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export function setSessionCookie(res, token) {
    res.cookie(
        SESSION_COOKIE_NAME,
        token,
        SESSION_COOKIE_OPTIONS
    );
}

export function clearSessionCookie(res) {
    res.clearCookie(
        SESSION_COOKIE_NAME,
        {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/"
        }
    );
}
import nodemailer from "nodemailer";

function getRequiredEnvironmentVariable(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}`
        );
    }

    return value;
}

function createTransporter() {
    const host =
        getRequiredEnvironmentVariable("SMTP_HOST");

    const port = Number(
        process.env.SMTP_PORT || 587
    );

    const user =
        getRequiredEnvironmentVariable("SMTP_USER");

    const password =
        getRequiredEnvironmentVariable(
            "SMTP_PASSWORD"
        );

    const secure =
        String(
            process.env.SMTP_SECURE || "false"
        ).toLowerCase() === "true";

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass: password
        }
    });
}

function getFromAddress() {
    return (
        process.env.SMTP_FROM ||
        process.env.SMTP_USER
    );
}

export async function sendPasswordResetEmail({
    email,
    fullName,
    resetUrl
}) {
    const transporter =
        createTransporter();

    const recipientName =
        fullName || "Member";

    const mailOptions = {
        from: getFromAddress(),

        to: email,

        subject:
            "Reset Your BAJIM Account Password",

        text: `
Hello ${recipientName},

We received a request to reset the password for your BAJIM BLOSSOM KITCHEN & HOUSEHOLD ITEMS account.

Use the link below to create a new password:

${resetUrl}

This password reset link will expire in 1 hour.

If you did not request a password reset, you can safely ignore this email.

For your security, do not share this link with anyone.

Regards,
BAJIM BLOSSOM KITCHEN & HOUSEHOLD ITEMS
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />
    <title>Reset Your BAJIM Password</title>
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background: #faf8f2;
        font-family: Arial, Helvetica, sans-serif;
        color: #26332b;
    "
>
    <div
        style="
            width: 100%;
            padding: 40px 16px;
            box-sizing: border-box;
        "
    >
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid #e7e2d5;
                border-radius: 20px;
                padding: 36px 28px;
                box-sizing: border-box;
            "
        >
            <div
                style="
                    width: 52px;
                    height: 52px;
                    line-height: 52px;
                    text-align: center;
                    background: #30483a;
                    color: #ffffff;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 24px;
                "
            >
                BB
            </div>

            <p
                style="
                    margin: 0 0 10px;
                    color: #7b8066;
                    font-size: 12px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                "
            >
                Account Recovery
            </p>

            <h1
                style="
                    margin: 0 0 18px;
                    color: #26332b;
                    font-size: 26px;
                    line-height: 1.3;
                "
            >
                Reset your password
            </h1>

            <p
                style="
                    margin: 0 0 18px;
                    color: #687069;
                    font-size: 15px;
                    line-height: 1.7;
                "
            >
                Hello ${recipientName},
            </p>

            <p
                style="
                    margin: 0 0 24px;
                    color: #687069;
                    font-size: 15px;
                    line-height: 1.7;
                "
            >
                We received a request to reset the password
                for your BAJIM account. Click the button below
                to create a new password.
            </p>

            <div style="margin: 28px 0;">
                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        background: #30483a;
                        color: #ffffff;
                        text-decoration: none;
                        padding: 14px 24px;
                        border-radius: 999px;
                        font-size: 14px;
                        font-weight: bold;
                    "
                >
                    Reset My Password
                </a>
            </div>

            <p
                style="
                    margin: 0 0 12px;
                    color: #687069;
                    font-size: 14px;
                    line-height: 1.7;
                "
            >
                This link will expire in 1 hour.
            </p>

            <p
                style="
                    margin: 0 0 24px;
                    color: #687069;
                    font-size: 14px;
                    line-height: 1.7;
                "
            >
                If you did not request this password reset,
                you can safely ignore this email.
            </p>

            <div
                style="
                    border-top: 1px solid #e7e2d5;
                    padding-top: 20px;
                "
            >
                <p
                    style="
                        margin: 0;
                        color: #9ca49e;
                        font-size: 12px;
                        line-height: 1.6;
                    "
                >
                    For your security, do not share your
                    password reset link with anyone.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
        `.trim()
    };

    await transporter.sendMail(
        mailOptions
    );
}

import {
    listAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    updateAnnouncementStatus
} from "../services/announcement-management.service.js";

import {
    recordAdminActivity
} from "../services/activity-log.service.js";

function handleError(
    res,
    error,
    fallbackMessage
) {
    console.error(
        fallbackMessage,
        error
    );

    return res.status(400).json({
        success: false,
        message:
            error.message ||
            fallbackMessage
    });
}

export async function getAnnouncements(
    req,
    res
) {
    try {
        const result =
            await listAnnouncements({
                search:
                    req.query.search ||
                    "",

                status:
                    req.query.status ||
                    "",

                category:
                    req.query.category ||
                    "",

                page:
                    req.query.page ||
                    1,

                limit:
                    req.query.limit ||
                    20
            });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to load announcements."
        );
    }
}

export async function getAnnouncement(
    req,
    res
) {
    try {
        const announcement =
            await getAnnouncementById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            announcement
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to load announcement."
        );
    }
}

export async function postAnnouncement(
    req,
    res
) {
    try {
        /*
         * The authenticated user ID comes
         * from the server-side session.
         *
         * We do NOT accept createdBy from
         * the browser.
         */
        const createdByUserId =
            req.auth?.userId;

        if (!createdByUserId) {
            return res.status(401).json({
                success: false,
                message:
                    "Authenticated administrator could not be identified."
            });
        }

        const announcement =
            await createAnnouncement({
                title:
                    req.body.title,

                content:
                    req.body.content,

                category:
                    req.body.category ||
                    "GENERAL",

                createdByUserId
            });

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "ANNOUNCEMENT_CREATED",

            entityType:
                "ANNOUNCEMENT",

            entityId:
                announcement?.id ||
                null,

            description:
                `Created announcement "${req.body.title}".`,

            metadata: {
                title:
                    req.body.title ||
                    null,

                category:
                    req.body.category ||
                    "GENERAL",

                status:
                    announcement?.status ||
                    "DRAFT"
            }
        });

        return res.status(201).json({
            success: true,
            message:
                "Announcement created successfully.",
            announcement
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to create announcement."
        );
    }
}

export async function patchAnnouncement(
    req,
    res
) {
    try {
        const announcement =
            await updateAnnouncement(
                req.params.id,
                {
                    title:
                        req.body.title,

                    content:
                        req.body.content,

                    category:
                        req.body.category
                }
            );

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action:
                "ANNOUNCEMENT_UPDATED",

            entityType:
                "ANNOUNCEMENT",

            entityId:
                announcement?.id ||
                req.params.id,

            description:
                `Updated announcement "${req.body.title || "announcement"}".`,

            metadata: {
                title:
                    req.body.title ||
                    null,

                category:
                    req.body.category ||
                    null
            }
        });

        return res.status(200).json({
            success: true,
            message:
                "Announcement updated successfully.",
            announcement
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to update announcement."
        );
    }
}

export async function patchAnnouncementStatus(
    req,
    res
) {
    try {
        const announcement =
            await updateAnnouncementStatus(
                req.params.id,
                req.body.status
            );

        let action =
            "ANNOUNCEMENT_STATUS_CHANGED";

        if (
            req.body.status ===
            "PUBLISHED"
        ) {
            action =
                "ANNOUNCEMENT_PUBLISHED";
        }

        if (
            req.body.status ===
            "ARCHIVED"
        ) {
            action =
                "ANNOUNCEMENT_ARCHIVED";
        }

        await recordAdminActivity({
            userId:
                req.auth.userId,

            req,

            action,

            entityType:
                "ANNOUNCEMENT",

            entityId:
                announcement?.id ||
                req.params.id,

            description:
                `Changed announcement status to ${req.body.status}.`,

            metadata: {
                newStatus:
                    req.body.status,

                title:
                    announcement?.title ||
                    null
            }
        });

        return res.status(200).json({
            success: true,
            message:
                "Announcement status updated successfully.",
            announcement
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to update announcement status."
        );
    }
}

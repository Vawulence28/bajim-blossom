import {
    findPublishedAnnouncements
} from "../models/announcement.model.js";

function formatAnnouncement(announcement) {
    return {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        publishedAt: announcement.published_at,
        createdAt: announcement.created_at,
        updatedAt: announcement.updated_at
    };
}

export async function getMemberAnnouncements(
    req,
    res,
    next
) {
    try {
        const announcements =
            await findPublishedAnnouncements();

        return res.status(200).json({
            success: true,
            data: {
                announcements:
                    announcements.map(
                        formatAnnouncement
                    )
            }
        });
    } catch (error) {
        next(error);
    }
}
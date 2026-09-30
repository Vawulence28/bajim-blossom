import {
    getActivityLog,
    listActivityLogs
} from "../services/activity-log.service.js";

function handleError(
    res,
    error
) {
    console.error(
        "Activity log error:",
        error
    );

    return res
        .status(
            error.statusCode ||
                500
        )
        .json({
            success: false,
            message:
                error.message ||
                "Unable to process activity log request."
        });
}

export async function getActivityLogs(
    req,
    res
) {
    try {
        const result =
            await listActivityLogs({
                search:
                    req.query.search ||
                    "",
                action:
                    req.query.action ||
                    "",
                entityType:
                    req.query.entityType ||
                    "",
                startDate:
                    req.query.startDate ||
                    "",
                endDate:
                    req.query.endDate ||
                    "",
                page:
                    req.query.page ||
                    1,
                pageSize:
                    req.query.pageSize ||
                    20
            });

        return res.json({
            success: true,
            data: result.rows,
            pagination:
                result.pagination
        });
    } catch (error) {
        return handleError(
            res,
            error
        );
    }
}

export async function getActivityLogDetails(
    req,
    res
) {
    try {
        const result =
            await getActivityLog(
                req.params.id
            );

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        return handleError(
            res,
            error
        );
    }
}

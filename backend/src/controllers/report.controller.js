import {
    getContributionReport,
    getPaymentReport,
    getFineReport,
    listReportMembers,
    getMemberStatement
} from "../services/report.service.js";

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

export async function getContributionsReport(
    req,
    res
) {
    try {
        const result =
            await getContributionReport({
                search:
                    req.query.search ||
                    "",
                status:
                    req.query.status ||
                    "",
                cycleId:
                    req.query.cycleId ||
                    "",
                startDate:
                    req.query.startDate ||
                    "",
                endDate:
                    req.query.endDate ||
                    "",
                page:
                    req.query.page || 1,
                limit:
                    req.query.limit || 50
            });

        return res.status(200).json({
            success: true,
            reportType:
                "CONTRIBUTIONS",
            ...result
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to generate contribution report."
        );
    }
}

export async function getPaymentsReport(
    req,
    res
) {
    try {
        const result =
            await getPaymentReport({
                search:
                    req.query.search ||
                    "",
                paymentStatus:
                    req.query.paymentStatus ||
                    "",
                paymentMethod:
                    req.query.paymentMethod ||
                    "",
                startDate:
                    req.query.startDate ||
                    "",
                endDate:
                    req.query.endDate ||
                    "",
                page:
                    req.query.page || 1,
                limit:
                    req.query.limit || 50
            });

        return res.status(200).json({
            success: true,
            reportType:
                "PAYMENTS",
            ...result
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to generate payment report."
        );
    }
}

export async function getFinesReport(
    req,
    res
) {
    try {
        const result =
            await getFineReport({
                search:
                    req.query.search ||
                    "",
                status:
                    req.query.status ||
                    "",
                startDate:
                    req.query.startDate ||
                    "",
                endDate:
                    req.query.endDate ||
                    "",
                page:
                    req.query.page || 1,
                limit:
                    req.query.limit || 50
            });

        return res.status(200).json({
            success: true,
            reportType:
                "FINES",
            ...result
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to generate fine report."
        );
    }
}

export async function getMembersForReports(
    req,
    res
) {
    try {
        const members =
            await listReportMembers({
                search:
                    req.query.search ||
                    "",
                status:
                    req.query.status ===
                    undefined
                        ? "ACTIVE"
                        : req.query.status
            });

        return res.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to load report members."
        );
    }
}

export async function getMemberStatementReport(
    req,
    res
) {
    try {
        const {
            id
        } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message:
                    "Member profile ID is required."
            });
        }

        const result =
            await getMemberStatement(
                id,
                {
                    startDate:
                        req.query.startDate ||
                        "",
                    endDate:
                        req.query.endDate ||
                        ""
                }
            );

        return res.status(200).json({
            success: true,
            reportType:
                "MEMBER_STATEMENT",
            ...result
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to generate member statement."
        );
    }
}

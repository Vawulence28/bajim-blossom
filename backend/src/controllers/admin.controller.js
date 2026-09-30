import { getAdminDashboardData } from "../services/admin.service.js";

export async function getAdminDashboard(req, res, next) {
    try {
        const dashboard = await getAdminDashboardData();

        return res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        next(error);
    }
}

export async function getAdminMe(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            user: req.auth
        }
    });
}
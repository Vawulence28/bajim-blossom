import {
listContributionCycles,
getContributionCycleById,
createContributionCycle,
updateContributionCycle,
updateContributionCycleStatus
} from "../services/contribution-cycle.service.js";

import {
recordAdminActivity
} from "../services/activity-log.service.js";

export async function getCycles(req, res, next) {
try {
const result = await listContributionCycles({
search: req.query.search,
status: req.query.status,
page: req.query.page,
limit: req.query.limit
});


    return res.json({
        success: true,
        data: result.cycles,
        pagination: result.pagination
    });
} catch (error) {
    next(error);
}


}

export async function getCycleDetails(req, res, next) {
try {
const cycle = await getContributionCycleById(
req.params.id
);


    if (!cycle) {
        return res.status(404).json({
            success: false,
            message: "Contribution cycle was not found."
        });
    }

    return res.json({
        success: true,
        data: cycle
    });
} catch (error) {
    next(error);
}


}

export async function createCycle(req, res, next) {
try {
const cycle = await createContributionCycle({
cycleName: req.body?.cycle_name,
startsAt: req.body?.starts_at,
dueAt: req.body?.due_at,
graceUntil: req.body?.grace_until,
contributionAmount: req.body?.contribution_amount,
fineAmount: req.body?.fine_amount,
status: req.body?.status,
notes: req.body?.notes
});


    /*
     * Record the administrative action.
     *
     * Activity-log failures must not prevent the
     * successfully created cycle from being returned.
     */
    await recordAdminActivity({
        userId: req.auth.userId,
        req,
        action: "CYCLE_CREATED",
        entityType: "CONTRIBUTION_CYCLE",
        entityId: cycle.id,
        description: `Created contribution cycle "${cycle.cycle_name}".`,
        metadata: {
            cycleName: cycle.cycle_name,
            status: cycle.status,
            contributionAmount: cycle.contribution_amount,
            fineAmount: cycle.fine_amount,
            startsAt: cycle.starts_at,
            dueAt: cycle.due_at,
            graceUntil: cycle.grace_until
        }
    });

    return res.status(201).json({
        success: true,
        message: "Contribution cycle created successfully.",
        data: cycle
    });
} catch (error) {
    next(error);
}


}

export async function updateCycle(req, res, next) {
try {
/*
* Get the existing record first so the activity log
* can contain the previous and updated values.
*/
const previousCycle = await getContributionCycleById(
req.params.id
);


    if (!previousCycle) {
        return res.status(404).json({
            success: false,
            message: "Contribution cycle was not found."
        });
    }

    const cycle = await updateContributionCycle(
        req.params.id,
        {
            cycleName: req.body?.cycle_name,
            startsAt: req.body?.starts_at,
            dueAt: req.body?.due_at,
            graceUntil: req.body?.grace_until,
            contributionAmount:
                req.body?.contribution_amount,
            fineAmount: req.body?.fine_amount,
            status: req.body?.status,
            notes: req.body?.notes
        }
    );

    if (!cycle) {
        return res.status(404).json({
            success: false,
            message: "Contribution cycle was not found."
        });
    }

    await recordAdminActivity({
        userId: req.auth.userId,
        req,
        action: "CYCLE_UPDATED",
        entityType: "CONTRIBUTION_CYCLE",
        entityId: cycle.id,
        description: `Updated contribution cycle "${cycle.cycle_name}".`,
        metadata: {
            previous: {
                cycleName: previousCycle.cycle_name,
                status: previousCycle.status,
                contributionAmount:
                    previousCycle.contribution_amount,
                fineAmount:
                    previousCycle.fine_amount,
                startsAt: previousCycle.starts_at,
                dueAt: previousCycle.due_at,
                graceUntil:
                    previousCycle.grace_until
            },
            updated: {
                cycleName: cycle.cycle_name,
                status: cycle.status,
                contributionAmount:
                    cycle.contribution_amount,
                fineAmount: cycle.fine_amount,
                startsAt: cycle.starts_at,
                dueAt: cycle.due_at,
                graceUntil: cycle.grace_until
            }
        }
    });

    return res.json({
        success: true,
        message: "Contribution cycle updated successfully.",
        data: cycle
    });
} catch (error) {
    next(error);
}


}

export async function changeCycleStatus(req, res, next) {
try {
/*
* Get the existing cycle so the audit log can record
* both the previous and new status.
*/
const previousCycle = await getContributionCycleById(
req.params.id
);


    if (!previousCycle) {
        return res.status(404).json({
            success: false,
            message: "Contribution cycle was not found."
        });
    }

    const newStatus = String(
        req.body?.status || ""
    )
        .trim()
        .toUpperCase();

    const cycle = await updateContributionCycleStatus(
        req.params.id,
        newStatus
    );

    if (!cycle) {
        return res.status(404).json({
            success: false,
            message: "Contribution cycle was not found."
        });
    }

    await recordAdminActivity({
        userId: req.auth.userId,
        req,
        action: "CYCLE_STATUS_CHANGED",
        entityType: "CONTRIBUTION_CYCLE",
        entityId: cycle.id,
        description:
            `Changed contribution cycle "${cycle.cycle_name}" ` +
            `status from "${previousCycle.status}" to "${cycle.status}".`,
        metadata: {
            previousStatus: previousCycle.status,
            newStatus: cycle.status
        }
    });

    return res.json({
        success: true,
        message:
            "Contribution cycle status updated successfully.",
        data: cycle
    });
} catch (error) {
    next(error);
}


}

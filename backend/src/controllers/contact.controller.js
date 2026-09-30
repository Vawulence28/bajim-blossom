import {
getPublicContactInformation,
createContactEnquiry,
getContactEnquiries,
getContactEnquiryById,
updateContactEnquiry
} from "../services/contact.service.js";

import {
recordAdminActivity
} from "../services/activity-log.service.js";

/*

* ============================================================
* PUBLIC CONTACT INFORMATION
* ============================================================
  */

export async function getContactInfo(
req,
res,
next
) {
try {
const contactInformation =
await getPublicContactInformation();


    return res.status(200).json({
        success: true,
        data: contactInformation
    });
} catch (error) {
    next(error);
}


}

/*

* ============================================================
* PUBLIC CONTACT ENQUIRY
* ============================================================
  */

export async function submitContactEnquiry(
req,
res,
next
) {
try {
const {
fullName,
email,
message
} = req.body;


    const enquiry =
        await createContactEnquiry({
            fullName,
            email,
            message
        });

    return res.status(201).json({
        success: true,
        message:
            "Your enquiry has been submitted successfully.",
        data: enquiry
    });
} catch (error) {
    next(error);
}


}

/*

* ============================================================
* ADMIN CONTACT ENQUIRIES
* ============================================================
  */

export async function getAdminContactEnquiries(
req,
res,
next
) {
try {
const {
status = "",
search = "",
limit = 50,
offset = 0
} = req.query;


    const result =
        await getContactEnquiries({
            status,
            search,
            limit,
            offset
        });

    return res.status(200).json({
        success: true,
        data: result
    });
} catch (error) {
    next(error);
}


}

export async function getAdminContactEnquiry(
req,
res,
next
) {
try {
const enquiry =
await getContactEnquiryById(
req.params.id
);


    return res.status(200).json({
        success: true,
        data: enquiry
    });
} catch (error) {
    next(error);
}


}

/*

* ============================================================
* UPDATE ADMIN CONTACT ENQUIRY
* ============================================================
  */

export async function updateAdminContactEnquiry(
req,
res,
next
) {
try {
const {
status,
adminNotes
} = req.body;


    /*
     * The authenticated profile ID is needed when
     * an enquiry is marked as RESOLVED.
     *
     * req.auth is created by requireAuthentication.
     */
    const userId =
        req.auth?.userId || null;

    const enquiry =
        await updateContactEnquiry(
            req.params.id,
            {
                status,
                adminNotes,
                userId
            }
        );

    /*
     * Record the administrative action.
     */
    if (userId) {
        try {
            await recordAdminActivity({
                actorId: userId,
                action:
                    "CONTACT_ENQUIRY_UPDATED",
                entityType:
                    "CONTACT_ENQUIRY",
                entityId: enquiry.id,
                description:
                    `Updated contact enquiry from ${enquiry.full_name}.`,
                metadata: {
                    status: enquiry.status
                },
                req
            });
        } catch (activityError) {
            /*
             * Activity logging should not prevent the
             * actual enquiry update from succeeding.
             */
            console.error(
                "Failed to record contact enquiry activity:",
                activityError
            );
        }
    }

    return res.status(200).json({
        success: true,
        message:
            "Contact enquiry updated successfully.",
        data: enquiry
    });
} catch (error) {
    next(error);
}


}

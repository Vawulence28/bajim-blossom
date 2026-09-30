import express from "express";

import {
getContactInfo,
submitContactEnquiry,
getAdminContactEnquiries,
getAdminContactEnquiry,
updateAdminContactEnquiry
} from "../controllers/contact.controller.js";

import {
requireAuthentication,
requireAdmin
} from "../middleware/auth.middleware.js";

const router = express.Router();

/*

* ============================================================
* PUBLIC CONTACT ROUTES
* ============================================================
  */

/*

* Get organization contact information.
  */
  router.get(
  "/info",
  getContactInfo
  );

/*

* Submit a public contact enquiry.
  */
  router.post(
  "/enquiries",
  submitContactEnquiry
  );



     router.use(
     "/admin",
     requireAuthentication,
     requireAdmin
     );

/*

* Get all contact enquiries.
  */
  router.get(
  "/admin/enquiries",
  getAdminContactEnquiries
  );

/*

* Get one contact enquiry.
  */
  router.get(
  "/admin/enquiries/:id",
  getAdminContactEnquiry
  );

/*

* Update one contact enquiry.
  */
  router.patch(
  "/admin/enquiries/:id",
  updateAdminContactEnquiry
  );

export default router;

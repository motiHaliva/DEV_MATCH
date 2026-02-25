import express from "express";
import { authorizeRole } from "../middleware/Authorize.js";
import {
  createRequest,
  getMyRequests,
  getMyCreatedRequests,
  acceptRequest,
  rejectRequest,
} from "../controllers/RequestsController.js";

const router = express.Router();

/* ==============================
   CREATE REQUEST
============================== */
router.post(
  "/",
  authorizeRole("admin", "freelancer", "client"),
  createRequest
);

/* ==============================
   MY INCOMING REQUESTS
============================== */
router.get("/my-requests", getMyRequests);

/* ==============================
   MY CREATED REQUESTS
============================== */
router.get("/my-created-requests", getMyCreatedRequests);

/* ==============================
   ACCEPT / REJECT
============================== */
router.put("/accept/:id", acceptRequest);
router.put("/reject/:id", rejectRequest);

export default router;
import express from "express";
import { getFreelancerReviews, addFreelancerReview } from "../controllers/freelancerReviewsController.js";


const router = express.Router();

// קבלת ביקורות עם פאגינציה
router.get("/:id", getFreelancerReviews);

// הוספת דירוג ותגובה (משתמש מחובר)
router.post("/:id", addFreelancerReview);

export default router;

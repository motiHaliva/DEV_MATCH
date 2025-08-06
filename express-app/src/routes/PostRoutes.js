// src/routes/PostRoutes.js
import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostDetails,
} from "../controllers/PostController.js";

const router = express.Router();

//.....,ץתךצמחנ יצירת פוסט חדש (נדרש חיבור)
router.post("/", createPost);

// שליפת כל הפוסטים (פומבי)
router.get("/", getAllPosts);

// שליפת פרטי פוסט מורחבים (עם תגובות ולייקים) - חייב להיות לפני /:id
router.get("/details/:id", getPostDetails);

// שליפת פוסט בודד (פומבי)
router.get("/:id", getPostById);

// עדכון פוסט (נדרש חיבור)
router.put("/:id", updatePost);

// מחיקת פוסט (נדרש חיבור)
router.delete("/:id", deletePost);

export default router;
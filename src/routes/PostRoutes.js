import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from "../controllers/postControler.js";

const router = express.Router();

// יצירת פוסט חדש (נדרש חיבור)
router.post("/", createPost);

// שליפת כל הפוסטים (פומבי)
router.get("/", getAllPosts);

// שליפת פוסט בודד (פומבי)
router.get("/:id", getPostById);

// עדכון פוסט (נדרש חיבור)
router.put("/:id", updatePost);

// מחיקת פוסט (נדרש חיבור)
router.delete("/:id", deletePost);

export default router;
// src/routes/PostLikeRoutes.js
import express from "express";
import {
  likePost,
  unlikePost,
  getLikesForPost,
  hasUserLikedPost,
} from "../controllers/PostLikeController.js";

const router = express.Router();

// לייק לפוסט
router.post("/:postId/like", likePost);

// ביטול לייק
router.delete("/:postId/unlike", unlikePost);

// שליפת רשימת לייקים לפוסט (אופציונלי)
router.get("/:postId/likes", getLikesForPost);

// האם המשתמש הנוכחי עשה לייק (לא חובה, נוח לפרונט)
router.get("/:postId/liked", hasUserLikedPost);

export default router;

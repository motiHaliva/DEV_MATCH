import PostLikeModel from "../models/PostLikeModel.js";
import PostModel from "../models/PostModel.js";
import pool from "../db.js";
import BaseModel from "../models/BaseModel.js";


export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;


    const existing = await BaseModel.runRawQuery(
      `SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [postId, userId]
    );

    if (existing.length) {
      return res.status(400).json({ error: "Already liked" });
    }

    // אם יש לייק ישן מחוק -> נעדכן אותו
    const softDeleted = await BaseModel.runRawQuery(
      `SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2 AND deleted_at IS NOT NULL`,
      [postId, userId]
    );

    if (softDeleted.length) {
      await PostLikeModel.update(softDeleted[0].id, {
        deleted_at: null,
        created_at: new Date()
      });
    } else {
      await PostLikeModel.create({
        post_id: postId,
        user_id: userId,
        created_at: new Date(),
        deleted_at: null,
      });
    }

    // עדכון likes_count
    await pool.query(
      `UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`,
      [postId]
    );

    res.status(201).json({ message: "Post liked" });
  } catch (err) {
    console.error("❌ Error liking post:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ביטול לייק (soft delete)
export const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const like = await BaseModel.runRawQuery(
      `SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [postId, userId]
    );

    if (!like.length) {
      return res.status(404).json({ error: "Like not found" });
    }

    await PostLikeModel.update(like[0].id, {
      deleted_at: new Date(),
    });

    await pool.query(
      `UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1`,
      [postId]
    );

    res.json({ message: "Post unliked" });
  } catch (err) {
    console.error("❌ Error unliking post:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ בדיקה אם המשתמש עשה לייק
export const hasUserLikedPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const liked = await BaseModel.runRawQuery(
      `SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [postId, userId]
    );

    res.json({ liked: liked.length > 0 });
  } catch (err) {
    console.error("❌ Error checking like:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ שליפת כל הלייקים לפוסט עם משתמשים
export const getLikesForPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const likes = await BaseModel.runRawQuery(
      `
      SELECT pl.*, u.firstname, u.lastname, u.profile_image
      FROM post_likes pl
      JOIN users u ON pl.user_id = u.id
      WHERE pl.post_id = $1 AND pl.deleted_at IS NULL
      ORDER BY pl.created_at DESC
      `,
      [postId]
    );

    res.json(likes);
  } catch (err) {
    console.error("❌ Error fetching likes:", err);
    res.status(500).json({ error: "Server error" });
  }
};

import PostCommentModel from "../models/PostCommentModel.js";
import postCommentSchema from "../validitions/postCommentSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";

// ✅ יצירת תגובה חדשה
export const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { error, value } = postCommentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const sanitized = sanitizeInput(value);

    const newComment = await PostCommentModel.create({
      post_id: sanitized.post_id,
      user_id: userId,
      content: sanitized.content,
      // created_at, updated_at, deleted_at מנוהלים במסד הנתונים
    });
      await PostModel.runRawQuery(
      `UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`,
      [sanitized.post_id]
    );

    res.status(201).json(newComment);
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ שליפת תגובות עם פגינציה (עם paginateRaw)
export const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { page = 1, limit = 10 } = req.query;

    const paginationResult = await PostCommentModel.paginateRaw({
      select: `pc.*, u.firstname, u.lastname, u.profile_image`,
      from: `post_comments pc JOIN users u ON pc.user_id = u.id`,
      where: `pc.post_id = $1 AND pc.deleted_at IS NULL`,
      values: [postId],
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy: `pc.created_at ASC`,
    });

    res.json(paginationResult);
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ עריכת תגובה
export const updateComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    const { error, value } = postCommentSchema.extract("content").validate({ content: req.body.content });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const sanitizedContent = sanitizeInput(value.content);

    const comment = await PostCommentModel.runRawQuery(
      `SELECT * FROM post_comments WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [commentId, userId]
    );

    if (!comment.length) return res.status(404).json({ error: "Comment not found or not yours" });

    const updated = await PostCommentModel.update(commentId, {
      content: sanitizedContent,
      updated_at: new Date(),
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating comment:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ מחיקה רכה
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    const comment = await PostCommentModel.runRawQuery(
      `SELECT * FROM post_comments WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [commentId, userId]
    );

    if (!comment.length) return res.status(404).json({ error: "Comment not found or not yours" });

    const deleted = await PostCommentModel.update(commentId, {
      deleted_at: new Date(),
    });
     await PostModel.runRawQuery(
      `UPDATE posts SET comments_count = comments_count - 1 WHERE id = $1 AND comments_count > 0`,
      [comment[0].post_id]
    );


    res.json({ message: "Comment deleted", deleted });
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    res.status(500).json({ error: "Server error" });
  }
};

import PostModel from "../models/PostModel.js";
import {postSchema ,updatePostSchema} from "../validitions/postSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";
import BaseModel from "../models/BaseModel.js";

const sanitizePostOutput = (post) => post;

export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
 

    const sanitizedData = sanitizeInput(req.body);
    sanitizedData.user_id = userId;

    const { error } = postSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newPost = await PostModel.create(sanitizedData);
    res.status(201).json(sanitizePostOutput(newPost));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// שליפת כל הפוסטים עם פאגינציה
export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, post_type, search } = req.query;

    let where = "p.deleted_at IS NULL AND u.deleted_at IS NULL";
    const values = [];

    if (user_id) {
      where += ` AND p.user_id = $${values.length + 1}`;
      values.push(user_id);
    }

    if (post_type) {
      where += ` AND p.post_type = $${values.length + 1}`;
      values.push(post_type);
    }

    if (search) {
      where += ` AND (
    p.content ILIKE $${values.length + 1}
    OR u.firstname ILIKE $${values.length + 2}
    OR u.lastname ILIKE $${values.length + 3}
  )`;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const result = await BaseModel.paginateRaw({
      select: `
        p.*,
        u.firstname AS user_firstname,
        u.lastname AS user_lastname,
        u.email AS user_email,
        u.profile_image AS user_avatar
      `,
      from: `
        posts p
        JOIN users u ON p.user_id = u.id
      `,
      where,
      values,
      page,
      limit,
      orderBy: "p.created_at DESC"
    });

    result.data = result.data.map(sanitizePostOutput); // השאר כמו שהיה

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const getPostById = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post || post.deleted_at) return res.status(404).json({ error: "Post not found" });
    res.json(sanitizePostOutput(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



export const updatePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post || post.deleted_at) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== post.user_id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { error, value } = updatePostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const sanitizedData = sanitizeInput(value);
    sanitizedData.updated_at = new Date();

    const updated = await PostModel.update(req.params.id, sanitizedData);
    res.json(sanitizePostOutput(updated));
  } catch (err) {
    console.error("❌ Error in updatePost:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const deletePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post || post.deleted_at) return res.status(404).json({ error: "Post not found" });

    const deleted = await PostModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Post not found or already deleted" });
    }

    res.json({ message: "Post soft-deleted successfully", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
export const getPostDetails = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    const postQuery = `
      SELECT 
        p.*,
        u.firstname AS user_firstname,
        u.lastname AS user_lastname,
        u.email AS user_email,
        u.profile_image AS user_avatar,
        COALESCE(p.likes_count, 0) as likes_count,
        COALESCE(p.comments_count, 0) as comments_count
        ${userId ? `, EXISTS(
          SELECT 1 FROM post_likes pl 
          WHERE pl.post_id = p.id AND pl.user_id = $2 AND pl.deleted_at IS NULL
        ) as user_liked` : ''}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.deleted_at IS NULL AND u.deleted_at IS NULL
    `;

    const postResult = await BaseModel.runRawQuery(
      postQuery,
      userId ? [postId, userId] : [postId]
    );

    if (!postResult.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = postResult[0];

    // שליפת התגובות האחרונות (5 תגובות)
    const commentsQuery = `
      SELECT 
        pc.*,
        u.firstname,
        u.lastname,
        u.profile_image
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = $1 AND pc.deleted_at IS NULL
      ORDER BY pc.created_at DESC
      LIMIT 5
    `;

    const comments = await BaseModel.runRawQuery(commentsQuery, [postId]);

    // שליפת הלייקים האחרונים (5 לייקים)
    const likesQuery = `
      SELECT 
        pl.user_id,
        pl.created_at,
        u.firstname,
        u.lastname,
        u.profile_image
      FROM post_likes pl
      JOIN users u ON pl.user_id = u.id
      WHERE pl.post_id = $1 AND pl.deleted_at IS NULL
      ORDER BY pl.created_at DESC
      LIMIT 5
    `;

    const likes = await BaseModel.runRawQuery(likesQuery, [postId]);

    // הרכבת התשובה
    const response = {
      ...sanitizePostOutput(post),
      recent_comments: comments,
      recent_likes: likes,
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching post details:", err);
    res.status(500).json({ error: "Server error" });
  }
};
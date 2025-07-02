import PostModel from "../models/PostModel.js";
import postSchema from "../validitions/postSchema.js";
import { sanitizeInput } from "../sanitize/sanitize.js";
import BaseModel from "../models/BaseModel.js";

const sanitizePostOutput = (post) => post;

// יצירת פוסט חדש
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

    let where = "deleted_at IS NULL";
    const values = [];

    if (user_id) {
      where += ` AND user_id = $${values.length + 1}`;
      values.push(user_id);
    }
    if (post_type) {
      where += ` AND post_type = $${values.length + 1}`;
      values.push(post_type);
    }
    if (search) {
      where += ` AND content ILIKE $${values.length + 1}`;
      values.push(`%${search}%`);
    }

    const result = await BaseModel.paginate(
      "posts",
      where,
      values,
      page,
      limit,
      "created_at DESC"
    );

    result.data = result.data.map(sanitizePostOutput);

    res.json(result);
  } catch (err) {
    console.error(err);
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
    if (!post || post.deleted_at) return res.status(404).json({ error: "Post not found" });

    if (req.user.role !== "admin" && req.user.id !== post.user_id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const sanitizedData = sanitizeInput(req.body);
    const { error } = postSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    sanitizedData.updated_at = new Date();

    const updated = await PostModel.update(req.params.id, sanitizedData);
    res.json(sanitizePostOutput(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// מחיקה רכה של פוסט (רק של בעל הפוסט או אדמין)
export const deletePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post || post.deleted_at) return res.status(404).json({ error: "Post not found" });

    if (req.user.role !== "admin" && req.user.id !== post.user_id) {
      return res.status(403).json({ error: "Access denied" });
    }

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
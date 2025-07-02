import express from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from '../controllers/PostCommentController.js';

const router = express.Router();



// יצירת תגובה חדשה
router.post('/', createComment);

// שליפת תגובות לפי postId עם פגינציה
router.get('/post/:postId', getCommentsByPost);

// עדכון תגובה לפי commentId
router.put('/:commentId', updateComment);

// מחיקה רכה של תגובה לפי commentId
router.delete('/:commentId', deleteComment);

export default router;

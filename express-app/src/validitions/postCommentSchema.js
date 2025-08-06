
import Joi from 'joi';

export const postCommentSchema = Joi.object({
  post_id: Joi.number().integer().positive().required(),
  content: Joi.string().trim().min(1).max(1000).required()
});



export const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required()
});


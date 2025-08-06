import Joi from "joi";

export const postSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  content: Joi.string().min(1).max(2000).required(),
image_url: Joi.string().uri().allow('').optional(),

  post_type: Joi.string().valid('freelancer', 'client', 'admin').optional(),
  likes_count: Joi.number().integer().min(0).optional(),
  comments_count: Joi.number().integer().min(0).optional(),
});



export const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(2000),
  image_url: Joi.string().uri().allow(''),
  post_type: Joi.string().valid('freelancer', 'client', 'admin'),
}).min(1);


import Joi from "joi";

const postSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  image_url: Joi.string().uri().optional().allow(null, ''),
  post_type: Joi.string().valid('freelancer', 'client', 'admin').required(),
  likes_count: Joi.number().integer().min(0).optional(),
  comments_count: Joi.number().integer().min(0).optional(),
});

export default postSchema;
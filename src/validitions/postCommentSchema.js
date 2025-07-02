import Joi from "joi";

const postCommentSchema = Joi.object({
  post_id: Joi.number().integer().required(),
  content: Joi.string().min(1).max(1000).required(),
});

export default postCommentSchema;
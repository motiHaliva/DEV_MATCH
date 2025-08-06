import Joi from "joi";

const freelancerSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),

  is_available: Joi.boolean().default(true),

  headline: Joi.string().max(255),

  bio: Joi.string().max(100).allow(null, ''),

  experience_years: Joi.number().integer().min(0),

  location: Joi.string().max(100).allow(null, ''),
});

export default freelancerSchema;

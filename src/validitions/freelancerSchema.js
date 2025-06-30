import Joi from "joi";

const freelancerSchema = Joi.object({

  user_id: Joi.number().integer().positive().optional(),
  
  is_available: Joi.boolean().default(true),

  headline: Joi.string().max(255).required(),

  bio: Joi.string().allow(null, ''), // שדה אופציונלי שמותר שיהיה ריק

  experience_years: Joi.number().integer().min(0).required(),

  location: Joi.string().max(100).allow(null, ''), // גם כן אופציונלי
});

export default freelancerSchema;

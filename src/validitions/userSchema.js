import Joi from "joi";


const userSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'client', 'freelancer').required(),
  password: Joi.string().min(6).required(),
  bio: Joi.string().max(500).optional()
});

export default userSchema;
import Joi from "joi";

const projectSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  deadline: Joi.date().iso().required(),
  is_open: Joi.boolean().default(true),
  project_type: Joi.string().valid('website', 'app', 'ecommerce').required(),
});

export default projectSchema;

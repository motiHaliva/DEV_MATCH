import Joi from "joi";

export const projectSchema = Joi.object({
  title: Joi.string().max(255).required(),
description: Joi.string().min(10).required(),
  deadline: Joi.date().iso().required(),
  is_open: Joi.boolean().default(true),
  project_type: Joi.string().valid('website', 'app', 'ecommerce').required(),
  client_id: Joi.number().optional(),
});



export const updateProjectSchema = Joi.object({
  title: Joi.string().max(255),
description: Joi.string().min(10),
  deadline: Joi.date().iso(),
  is_open: Joi.boolean(),
  project_type: Joi.string().valid('website', 'app', 'ecommerce'),

}).min(1); 



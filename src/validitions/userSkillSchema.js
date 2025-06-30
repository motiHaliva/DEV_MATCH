import Joi from "joi";

const userTitleSchema = Joi.object({
    skill_id: Joi.number().integer().positive().required(),
});

export default userTitleSchema;
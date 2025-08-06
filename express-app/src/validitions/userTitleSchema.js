import Joi from "joi";


const userTitleSchema = Joi.object({
    title_id: Joi.number().integer().positive().required(),
});
export default userTitleSchema;
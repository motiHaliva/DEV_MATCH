import Joi from "joi";

const requestSchema = Joi.object({
  to_user_id: Joi.number().integer().required(),
  project_id: Joi.number().integer().allow(null), // לא חובה
  status: Joi.string()
    .valid("pending", "matched", "declined")
    .optional(), // בבקשה חדשה זה יתווסף אוטומטית
});

export default requestSchema;

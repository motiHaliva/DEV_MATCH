import Joi from "joi";

// סכמה מלאה ליצירת משתמש (דורשת role ו־password)
const userSchema = Joi.object({
  firstname: Joi.string()
    .pattern(/^[A-Za-zא-ת\s'-]+$/)
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.pattern.base': 'First name can only contain letters and spaces',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must be at most 30 characters',
    }),

  lastname: Joi.string()
    .pattern(/^[A-Za-zא-ת\s'-]+$/)
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must be at most 30 characters',
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
    }),

  role: Joi.string()
    .valid('admin', 'client', 'freelancer')
    .required()
    .messages({
      'any.only': 'Role must be one of: admin, client, freelancer',
      'string.empty': 'Role is required',
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must include uppercase, lowercase and a number',
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must be no more than 30 characters',
      'string.empty': 'Password is required',
    }),

      phone: Joi.string()
    .pattern(/^(?:\+972|0)(?:[23489]|5[0-9]|77)[0-9]{7}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid Israeli phone number',
      'any.required': 'Phone number is required'
    }),

  bio: Joi.string()
    .max(500)
    .pattern(/^[\u0590-\u05FF\w\s.,;:'"!?()\-–—@#&%$]*$/)
    .messages({
      'string.max': 'Bio must be at most 500 characters',
      'string.pattern.base': 'Bio contains invalid characters',
    })
    .allow('', null),
});


export const updateUserSchema = Joi.object({
  firstname: userSchema.extract('firstname'),
  lastname: userSchema.extract('lastname'),
  email: userSchema.extract('email'),
    phone: userSchema.extract('phone'),
  bio: userSchema.extract('bio'),
  profile_image: Joi.string().uri().allow('', null).optional(),
});

export default userSchema;

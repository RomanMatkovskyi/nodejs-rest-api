const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required()
    .messages({
      "any.required": "email",
    }),
  password: Joi.string().required().messages({
    "any.required": "password",
  }),
});

module.exports = userSchema;

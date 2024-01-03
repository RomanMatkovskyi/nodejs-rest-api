const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "name",
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required()
    .messages({
      "any.required": "email",
    }),
  phone: Joi.string().required().messages({
    "any.required": "phone",
  }),
});

module.exports = contactSchema;

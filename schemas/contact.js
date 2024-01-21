const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "name",
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required()
    .messages({
      "any.required": "email",
    }),
  phone: Joi.number().required().messages({
    "any.required": "phone",
  }),
  favorite: Joi.boolean(),
});

module.exports = contactSchema;

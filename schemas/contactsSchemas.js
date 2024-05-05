import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  phone: Joi.string()
    .pattern(/^(\d{10})$|^(\(\d{3}\) \d{3}-\d{4})$|^(\d{3}-\d{3}-\d{4})$/)
    .message(
      "Phone number must be in the format (XXX) XXX-XXXX, XXX-XXX-XXXX, or XXXXXXXXXX"
    )
    .required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email({ minDomainSegments: 2 }),
  phone: Joi.string()
    .pattern(/^(\d{10})$|^(\(\d{3}\) \d{3}-\d{4})$|^(\d{3}-\d{3}-\d{4})$/)
    .message(
      "Phone number must be in the format (XXX) XXX-XXXX, XXX-XXX-XXXX, or XXXXXXXXXX"
    ),
});

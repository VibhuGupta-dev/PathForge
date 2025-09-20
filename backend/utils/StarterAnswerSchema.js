import Joi from "joi";

// Validation for storing option text instead of value
const starterAnswerSchema = Joi.array().items(
  Joi.object({
    questionText: Joi.string().required().messages({
      "string.empty": "Question text is required",
    }),
    selectedOption: Joi.string().required().messages({
      "string.empty": "Selected option is required",
    }),
  })
).length(10).messages({
  "array.length": "Exactly 10 starter answers are required",
});

export { starterAnswerSchema };

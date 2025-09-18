import Joi from "joi";

const starterAnswerSchema = Joi.array().items(
  Joi.object({
    questionText: Joi.string().required().messages({
      "string.empty": "Question text is required",
    }),
    selectedOption: Joi.string()
      .valid("a", "b", "c", "d", "e", "f", "g")
      .required()
      .messages({
        "any.only": "Invalid option selected",
        "string.empty": "Selected option is required",
      }),
  })
).length(10).messages({
  "array.length": "Exactly 10 starter answers are required",
});

export { starterAnswerSchema };
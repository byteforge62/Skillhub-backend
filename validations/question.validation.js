const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const questionOptionSchema = z.object({
  text: z
    .string({ required_error: "Option text is required" })
    .trim()
    .min(1, "Option text cannot be empty")
    .max(500),

  isCorrect: z.boolean({
    required_error: "isCorrect is required",
  }),

  explanation: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .default(""),
});

const createQuestionSchema = z.object({
  params: z.object({
    quizId: objectIdSchema,
  }),

  body: z
    .object({
      question: z
        .string({ required_error: "Question is required" })
        .trim()
        .min(5, "Question must be at least 5 characters")
        .max(1000),

      options: z
        .array(questionOptionSchema)
        .length(4, "Exactly 4 options are required"),

      points: z
        .number()
        .positive("Points must be greater than 0")
        .default(1),

      order: z
        .number()
        .int("Question order must be a whole number")
        .min(1),
    })
    .refine(
      (data) =>
        data.options.some((option) => option.isCorrect === true),
      {
        message: "At least one option must be marked as correct",
        path: ["options"],
      }
    ),
});

const updateQuestionSchema = z.object({
  params: z.object({
    questionId: objectIdSchema,
  }),

  body: z
    .object({
      question: z
        .string()
        .trim()
        .min(5, "Question must be at least 5 characters")
        .max(1000)
        .optional(),

      options: z
        .array(questionOptionSchema)
        .length(4, "Exactly 4 options are required")
        .optional(),

      points: z
        .number()
        .positive("Points must be greater than 0")
        .optional(),

      order: z
        .number()
        .int("Question order must be a whole number")
        .min(1)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the question",
    })
    .refine(
      (data) =>
        data.options === undefined ||
        data.options.some((option) => option.isCorrect === true),
      {
        message: "At least one option must be marked as correct",
        path: ["options"],
      }
    ),
});

const questionQuerySchema = z.object({
  params: z.object({
    questionId: objectIdSchema,
  }),
});

const quizQuestionsQuerySchema = z.object({
  params: z.object({
    quizId: objectIdSchema,
  }),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  questionQuerySchema,
  quizQuestionsQuerySchema,
};
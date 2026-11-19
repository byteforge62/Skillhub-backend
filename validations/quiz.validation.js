const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const createQuizSchema = z.object({
  body: z.object({
    course: objectIdSchema,

    title: z
      .string({ required_error: "Quiz title is required" })
      .trim()
      .min(3, "Quiz title must be at least 3 characters")
      .max(200),

    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .default(""),

    passingScore: z
      .number()
      .min(0)
      .max(100)
      .default(60),
  }),
});

const updateQuizSchema = z.object({
  params: z.object({
    quizId: objectIdSchema,
  }),

  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Quiz title must be at least 3 characters")
        .max(200)
        .optional(),

      description: z
        .string()
        .trim()
        .max(1000)
        .optional(),

      passingScore: z
        .number()
        .min(0)
        .max(100)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the quiz",
    }),
});

const quizQuerySchema = z.object({
  params: z.object({
    quizId: objectIdSchema,
  }),
});

const courseQuizQuerySchema = z.object({
  params: z.object({
    courseId: objectIdSchema,
  }),
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  quizQuerySchema,
  courseQuizQuerySchema,
};
const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const submitQuizAttemptSchema = z.object({
  params: z.object({
    quizId: objectIdSchema,
  }),

  body: z.object({
    answers: z
      .array(
        z.object({
          question: objectIdSchema,
          selectedOption: objectIdSchema,
        })
      )
      .min(1, "At least one answer is required"),
  }),
});

const attemptQuerySchema = z.object({
  params: z.object({
    attemptId: objectIdSchema,
  }),
});

const quizAttemptsQuerySchema = z.object({
  params: z.object({
    quizId: objectIdSchema,
  }),
});

module.exports = {
  submitQuizAttemptSchema,
  attemptQuerySchema,
  quizAttemptsQuerySchema,
};
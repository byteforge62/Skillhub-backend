const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const saveProgressSchema = z.object({
  body: z.object({
    userId: objectIdSchema.optional(),
    courseId: objectIdSchema,
    currentQuestionIdx: z.coerce.number().int().min(0).max(100000).default(0),
    quizAnswers: z
      .record(z.string(), z.string().max(2000))
      .default({}),
  }),
});

const getProgressParamsSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
    courseId: objectIdSchema,
  }),
});

module.exports = {
  saveProgressSchema,
  getProgressParamsSchema,
};

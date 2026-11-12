const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const userIdParamsSchema = z.object({
  params: z.object({ userId: objectIdSchema }),
});

const createAchievementSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    icon: z.string().trim().min(1).max(500),
    pointsRequired: z.number().int().min(0),
  }),
});

module.exports = {
  userIdParamsSchema,
  createAchievementSchema,
};

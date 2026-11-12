const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const userIdParamsSchema = z.object({
  params: z.object({ userId: objectIdSchema }),
});

const notificationIdParamsSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

module.exports = {
  userIdParamsSchema,
  notificationIdParamsSchema,
};

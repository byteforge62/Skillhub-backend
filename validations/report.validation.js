const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const createReportSchema = z.object({
  body: z.object({
    type: z.enum(["bug", "abuse", "inappropriate"]),
    description: z.string().trim().max(1000).optional().default(""),
    targetType: z.enum(["Course", "User", "Post", "Comment"]),
    targetId: objectIdSchema,
  }),
});

const reportIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const reportQuerySchema = z.object({
  query: z.object({
    status: z.enum(["open", "reviewing", "closed"]).optional(),
    type: z.enum(["bug", "abuse", "inappropriate"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

const updateReportStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(["open", "reviewing", "closed"]),
  }),
});

module.exports = {
  createReportSchema,
  reportIdParamsSchema,
  reportQuerySchema,
  updateReportStatusSchema,
};

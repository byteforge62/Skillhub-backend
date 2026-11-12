const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const addCertificateSchema = z.object({
  body: z.object({
    userId: objectIdSchema,
    courseId: objectIdSchema,
    certificateUrl: z.string().url(),
  }),
});

const userIdParamsSchema = z.object({
  params: z.object({ userId: objectIdSchema }),
});

module.exports = {
  addCertificateSchema,
  userIdParamsSchema,
};

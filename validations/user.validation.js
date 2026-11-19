const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");
const avatarUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Avatar must be an HTTP or HTTPS URL");

const userIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const userSearchQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().max(100).optional(),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      fullname: z.string().trim().min(2).max(100).optional(),
      avatar: avatarUrlSchema.optional(),
      bio: z.string().trim().max(2000).optional(),
      github: z.string().trim().max(500).optional(),
      linkedin: z.string().trim().max(500).optional(),
      twitter: z.string().trim().max(500).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one profile field is required",
    }),
});

module.exports = {
  userIdParamsSchema,
  userSearchQuerySchema,
  updateUserSchema,
};
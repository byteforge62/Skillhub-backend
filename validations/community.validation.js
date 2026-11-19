const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const communityIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const createCommunitySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().min(1).max(5000),
    coverImage: z.string().trim().max(1000).optional().default(""),
  }),
});

const updateCommunitySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      description: z.string().trim().min(1).max(5000).optional(),
      coverImage: z.string().trim().max(1000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the community",
    }),
});

const targetMemberSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    userId: objectIdSchema,
  }),
});

const communityPostActionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    postId: objectIdSchema,
  }),
});

const communityPostsQuerySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["new", "old", "top"]).default("new"),
    q: z.string().trim().max(100).optional(),
  }),
});

module.exports = {
  communityIdParamsSchema,
  createCommunitySchema,
  updateCommunitySchema,
  targetMemberSchema,
  communityPostActionSchema,
  communityPostsQuerySchema,
};

const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");
const contentSchema = z.string().trim().min(1).max(10000);
const mediaSchema = z
  .array(z.string().trim().min(1).max(2048))
  .max(10)
  .default([]);

const postIdParamsSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

const createPostSchema = z.object({
  body: z.object({
    communityId: objectIdSchema.nullable().optional(),
    content: contentSchema,
    media: mediaSchema.optional(),
  }),
});

const updatePostSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z
    .object({
      content: contentSchema.optional(),
      media: mediaSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the post",
    }),
});

const postListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["new", "old", "top"]).default("new"),
    q: z.string().trim().max(100).optional(),
    communityId: objectIdSchema.optional(),
  }),
});

const communityPostQuerySchema = z.object({
  params: z.object({ communityId: objectIdSchema }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["new", "old", "top"]).default("new"),
    q: z.string().trim().max(100).optional(),
  }),
});

const userPostQuerySchema = z.object({
  params: z.object({ userId: objectIdSchema }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["new", "old", "top"]).default("new"),
  }),
});

const commentSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({ content: z.string().trim().min(1).max(5000) }),
});

const deleteCommentSchema = z.object({
  params: z.object({ commentId: objectIdSchema }),
});

const commentReplySchema = z.object({
  params: z.object({
    postId: objectIdSchema,
    commentId: objectIdSchema,
  }),
  body: z.object({ content: z.string().trim().min(1).max(5000) }),
});

module.exports = {
  postIdParamsSchema,
  createPostSchema,
  updatePostSchema,
  postListQuerySchema,
  communityPostQuerySchema,
  userPostQuerySchema,
  commentSchema,
  deleteCommentSchema,
  commentReplySchema,
};

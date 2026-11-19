const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");
const messageIdParamsSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

const sendMessageSchema = z.object({
  body: z.object({
    receiverId: objectIdSchema,
    text: z.string().trim().min(1).max(5000),
    replyTo: objectIdSchema.optional().nullable(),
  }),
});

const conversationParamsSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
    otherUserId: objectIdSchema,
  }),
});

const reactionSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    emoji: z.string().trim().min(1).max(32),
  }),
});

const replySchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    text: z.string().trim().min(1).max(5000),
  }),
});

const editMessageSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    text: z.string().trim().min(1).max(5000),
  }),
});

module.exports = {
  messageIdParamsSchema,
  sendMessageSchema,
  conversationParamsSchema,
  reactionSchema,
  replySchema,
  editMessageSchema,
};

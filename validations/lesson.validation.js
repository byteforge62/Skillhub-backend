const { z } = require("zod");
const { httpUrlSchema } = require("./common.validation");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const textBlockSchema = z.object({
  type: z.literal("text"),
  order: z.number().int().min(1),
  data: z.object({
    content: z.string().trim().min(1).max(20000),
  }),
});

const codeBlockSchema = z.object({
  type: z.literal("code"),
  order: z.number().int().min(1),
  data: z.object({
    language: z.string().trim().min(1).max(50),
    code: z.string().min(1).max(30000),
  }),
});

const imageBlockSchema = z.object({
  type: z.literal("image"),
  order: z.number().int().min(1),
  data: z.object({
    url: httpUrlSchema,
    alt: z.string().trim().max(200).optional().default(""),
    caption: z.string().trim().max(300).optional().default(""),
  }),
});

const videoBlockSchema = z.object({
  type: z.literal("video"),
  order: z.number().int().min(1),
  data: z.object({
    url: httpUrlSchema,
    provider: z.string().trim().min(1).max(50).optional(),
  }),
});

const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  order: z.number().int().min(1),
  data: z.object({
    variant: z.enum(["info", "tip", "warning", "important"]),
    title: z.string().trim().max(150).optional().default(""),
    content: z.string().trim().min(1).max(5000),
  }),
});

const resourceBlockSchema = z.object({
  type: z.literal("resource"),
  order: z.number().int().min(1),
  data: z.object({
    resourceId: objectIdSchema,
  }),
});

const quizBlockSchema = z.object({
  type: z.literal("quiz"),
  order: z.number().int().min(1),
  data: z.object({
    quizId: objectIdSchema,
  }),
});

const toolBlockSchema = z.object({
  type: z.literal("tool"),
  order: z.number().int().min(1),
  data: z.object({
    toolId: z
      .string()
      .trim()
      .min(1, "Tool ID is required")
      .max(100, "Tool ID is too long"),
  }),
});

const lessonBlockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  codeBlockSchema,
  imageBlockSchema,
  videoBlockSchema,
  calloutBlockSchema,
  resourceBlockSchema,
  quizBlockSchema,
  toolBlockSchema,
]);

const createLessonSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Lesson title is required" })
      .trim()
      .min(2)
      .max(200),
    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .default(""),
    blocks: z.array(lessonBlockSchema).max(100).default([]),
    duration: z
      .number()
      .int("Lesson duration must be a whole number")
      .min(0)
      .default(0),
    order: z
      .number({ required_error: "Lesson order is required" })
      .int("Lesson order must be a whole number")
      .min(1),
    isPreview: z.boolean().default(false),
  }),
});

const updateLessonSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(200).optional(),
      description: z.string().trim().max(1000).optional(),
      blocks: z.array(lessonBlockSchema).max(100).optional(),
      duration: z.number().int().min(0).optional(),
      order: z.number().int().min(1).optional(),
      isPreview: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the lesson",
    }),
});

module.exports = {
  lessonBlockSchema,
  createLessonSchema,
  updateLessonSchema,
};
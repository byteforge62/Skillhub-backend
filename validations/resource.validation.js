const { z } = require("zod");
const { httpUrlSchema } = require("./common.validation");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const createResourceSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Resource title is required" })
      .trim()
      .min(2)
      .max(200),

    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .default(""),

    type: z.enum(["link", "document", "video", "repository"], {
      required_error: "Resource type is required",
    }),

    url: httpUrlSchema,

    thumbnail: httpUrlSchema.nullable().optional(),

    category: objectIdSchema.optional().nullable(),

    tags: z
      .array(z.string().trim().min(1).max(50))
      .max(10)
      .optional()
      .default([]),
  }),
});

const updateResourceSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(200).optional(),
      description: z.string().trim().max(1000).optional(),
      type: z
        .enum(["link", "document", "video", "repository"])
        .optional(),
      url: httpUrlSchema.optional(),
      thumbnail: httpUrlSchema.nullable().optional(),
      category: objectIdSchema.optional().nullable(),
      tags: z
        .array(z.string().trim().min(1).max(50))
        .max(10)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the resource",
    }),
});

const resourceQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    type: z
      .enum(["link", "document", "video", "repository"])
      .optional(),
    category: objectIdSchema.optional(),
    sort: z
      .enum(["newest", "oldest"])
      .default("newest"),
  }),
});

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
};
const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Course title is required",
      })
      .trim()
      .min(3, "Course title must be at least 3 characters")
      .max(150, "Course title cannot exceed 150 characters"),

    description: z
      .string({
        required_error: "Course description is required",
      })
      .trim()
      .min(20, "Course description must be at least 20 characters")
      .max(2000, "Course description cannot exceed 2000 characters"),

    category: objectIdSchema,

    imageUrl: z
      .string()
      .url("Invalid image URL")
      .optional()
      .nullable(),

    price: z
      .number()
      .min(0, "Course price cannot be negative")
      .default(0),

    duration: z
      .number()
      .int("Course duration must be a whole number")
      .positive("Course duration must be greater than 0"),

    level: z
      .enum(["Beginner", "Intermediate", "Advanced"])
      .default("Beginner"),

    language: z
      .string()
      .trim()
      .min(1, "Language is required")
      .max(50, "Language cannot exceed 50 characters")
      .default("English"),

    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Tag cannot be empty")
          .max(50, "Tag cannot exceed 50 characters")
      )
      .max(10, "A course cannot have more than 10 tags")
      .default([]),

    overview: z
      .string()
      .trim()
      .max(3000, "Course overview cannot exceed 3000 characters")
      .optional()
      .nullable(),
  }),
});

const updateCourseSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Course title must be at least 3 characters")
        .max(150, "Course title cannot exceed 150 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .min(20, "Course description must be at least 20 characters")
        .max(2000, "Course description cannot exceed 2000 characters")
        .optional(),

      category: objectIdSchema.optional(),

      imageUrl: z
        .string()
        .url("Invalid image URL")
        .optional()
        .nullable(),

      price: z
        .number()
        .min(0, "Course price cannot be negative")
        .optional(),

      duration: z
        .number()
        .int("Course duration must be a whole number")
        .positive("Course duration must be greater than 0")
        .optional(),

      level: z
        .enum(["Beginner", "Intermediate", "Advanced"])
        .optional(),

      language: z
        .string()
        .trim()
        .min(1, "Language is required")
        .max(50, "Language cannot exceed 50 characters")
        .optional(),

      tags: z
        .array(
          z
            .string()
            .trim()
            .min(1, "Tag cannot be empty")
            .max(50, "Tag cannot exceed 50 characters")
        )
        .max(10, "A course cannot have more than 10 tags")
        .optional(),

      overview: z
        .string()
        .trim()
        .max(3000, "Course overview cannot exceed 3000 characters")
        .optional()
        .nullable(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required to update the course",
      }
    ),
});

const courseQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    category: objectIdSchema.optional(),
    level: z.enum(["Beginner","Intermediate","Advanced"]).optional(),
    language: z.string().trim().max(50).optional(),
    sort: z.enum(["newest","oldest","price_low","price_high"]).default("newest"),
  }),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
};
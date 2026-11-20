const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const createEnrollmentSchema = z.object({
  body: z.object({
    courseId: objectIdSchema,
  }),
});

const updateEnrollmentSchema = z.object({
  body: z
    .object({
      status: z
        .enum(["active", "completed", "dropped", "cancelled"])
        .optional(),

      progress: z
        .number()
        .min(0)
        .max(100)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the enrollment",
    }),
});

const enrollmentIdParamsSchema = z.object({
  params: z.object({
    enrollmentId: objectIdSchema,
  }),
});

const completeLessonParamsSchema = z.object({
  params: z.object({
    enrollmentId: objectIdSchema,
    lessonId: objectIdSchema,
  }),
});

const lessonNoteSchema = z.object({
  params: z.object({
    enrollmentId: objectIdSchema,
    lessonId: objectIdSchema,
  }),
  body: z.object({
    content: z
      .string({ required_error: "Note content is required" })
      .max(5000, "A note cannot exceed 5000 characters"),
  }),
});

module.exports = {
  createEnrollmentSchema,
  updateEnrollmentSchema,
  enrollmentIdParamsSchema,
  completeLessonParamsSchema,
  lessonNoteSchema,
};
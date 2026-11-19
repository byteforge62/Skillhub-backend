const { z } = require("zod");

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const createCourseSectionSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: "Section title isrequired" })
            .trim()
            .min(2)
            .max(150),
        description: z
            .string()
            .trim()
            .max(500)
            .optional()
            .default(""),
        order: z
            .number({ required_error: "Section order is required" })
            .int("Section order must be a whole number")
            .min(1),
    })
});

const updateCourseSectionSchema = z.object({
    body: z
        .object({
            title: z.string().trim().min(2).max(150).optional(),
            description: z.string().trim().max(500).optional(),
            order: z
                .number()
                .int("Section order must be a whole number")
                .min(1)
                .optional()
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: "At least one field is required to update the section"
        })
})

module.exports = {
    createCourseSectionSchema,
    updateCourseSectionSchema
}
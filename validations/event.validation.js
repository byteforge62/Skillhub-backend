const { z } = require("zod");
const { httpUrlSchema } = require("./common.validation");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");
const isoDateTimeSchema = z.string().datetime({ offset: true });

const eventFields = {
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(1).max(5000),
  date: isoDateTimeSchema,
  location: z.string().trim().min(2).max(300),
  banner: httpUrlSchema,
};

const createEventSchema = z.object({
  body: z.object(eventFields),
});

const eventIdParamsSchema = z.object({
  params: z.object({
    eventId: objectIdSchema,
  }),
});

const updateEventSchema = z.object({
  params: z.object({
    eventId: objectIdSchema,
  }),
  body: z
    .object({
      title: eventFields.title.optional(),
      description: eventFields.description.optional(),
      date: eventFields.date.optional(),
      location: eventFields.location.optional(),
      banner: eventFields.banner.optional(),
      status: z.literal("published").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update the event",
    }),
});

const eventQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      q: z.string().trim().max(100).optional(),
      from: isoDateTimeSchema.optional(),
      to: isoDateTimeSchema.optional(),
    })
    .refine(
      (query) =>
        !query.from || !query.to || new Date(query.from) <= new Date(query.to),
      {
        path: ["to"],
        message: "The end date must be on or after the start date",
      },
    ),
});

module.exports = {
  createEventSchema,
  eventIdParamsSchema,
  eventQuerySchema,
  updateEventSchema,
};

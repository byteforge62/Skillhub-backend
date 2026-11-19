const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const paramsSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

const updateSettingsSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
  body: z
    .object({
      profilePublic: z.boolean().optional(),
      showActivity: z.boolean().optional(),
      showProgress: z.boolean().optional(),
      theme: z.enum(["light", "dark", "system"]).optional(),
      animationsEnabled: z.boolean().optional(),
      compactMode: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      courseUpdates: z.boolean().optional(),
      achievementAlerts: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one setting is required",
    }),
});

module.exports = {
  paramsSchema,
  updateSettingsSchema,
};

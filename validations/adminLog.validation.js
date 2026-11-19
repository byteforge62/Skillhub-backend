const { z } = require("zod");

const createAdminLogSchema = z.object({
  body: z.object({
    action: z
      .enum([
        "CREATE_COURSE",
        "DELETE_COURSE",
        "PUBLISH_BLOG",
        "DELETE_USER",
        "UPDATE_SETTINGS",
        "OTHER",
      ])
      .default("OTHER"),
    details: z.string().trim().min(1).max(1000),
  }),
});

module.exports = {
  createAdminLogSchema,
};

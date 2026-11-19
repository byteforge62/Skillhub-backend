const { z } = require("zod");

const httpUrlSchema = z
  .string()
  .trim()
  .url("Invalid URL")
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "URL must use HTTP or HTTPS",
  });

module.exports = {
  httpUrlSchema,
};

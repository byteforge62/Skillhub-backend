const { z } = require("zod");

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),
  }),
});


module.exports = forgotPasswordSchema;
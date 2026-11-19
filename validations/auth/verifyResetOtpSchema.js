const { z } = require("zod");

const verifyResetOtpSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    otp: z
      .string({
        required_error: "OTP is required",
      })
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
  }),
});

module.exports = verifyResetOtpSchema;

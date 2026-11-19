const { z } = require("zod");

const resetPasswordSchema = z.object({
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

    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      ),
  }),
});

module.exports = resetPasswordSchema;
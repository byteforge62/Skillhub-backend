const { z } = require("zod");

const registerSchema = z.object({
    body: z.object({
        fullname: z
            .string({
                required_error: "Full name is required",
            })
            .trim()
            .min(3, "Full name must be at least 3 characters")
            .max(100, "Full name cannot exceed 100 characters"),

        email: z
            .string({
                required_error: "Email is required",
            })
            .trim()
            .email("Please provide a valid email address")
            .toLowerCase(),

        password: z
            .string({
                required_error: "Password is required",
            })
            .min(8, "Password must be at least 8 characters")
            .max(64, "Password cannot exceed 64 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            ),
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters"),
  }),
});

module.exports = {
    registerSchema,
    loginSchema,
};
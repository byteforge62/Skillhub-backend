const {z} = require("zod");

const verifyEmailSchema = z.object({
    body:z.object({
        email:z.string().trim().email().toLowerCase(),
        otp:z
        .string()
        .trim()
        .length(6,"OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers")
    }),
    params:z.object({}),
    query:z.object({}),
})
module.exports = verifyEmailSchema;
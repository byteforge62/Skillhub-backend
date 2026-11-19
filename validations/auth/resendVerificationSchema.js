const {z} = require("zod");

const resendVerificationSchema = z.object({
    body: z.object({
        email: z.string().trim().email().toLowerCase(),
    }),
    params: z.object({}),
    query: z.object({})
});

module.exports = resendVerificationSchema;
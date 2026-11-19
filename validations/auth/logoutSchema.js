const {z} = require("zod");

const logoutSchema = z.object({
    body:z.object({
        refreshToken: z.string().min(1),
    }),
    params: z.object({}),
    query: z.object({})
});

module.exports = logoutSchema;
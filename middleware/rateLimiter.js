const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.GLOBAL_RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registration attempts. Please try again later.",
    },
});

const verifyOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: Number(process.env.OTP_RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP verification attempts.",
    },
});

const resendOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: Number(process.env.RESEND_OTP_RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP resend requests.",
    },
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: Number(process.env.OTP_RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many Forgot password attempts.",
    },
});

const resetPasswordLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: Number(process.env.OTP_RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many Reset Password attempts.",
    },
});
module.exports = {
    globalLimiter,
    loginLimiter,
    registerLimiter,
    verifyOtpLimiter,
    resendOtpLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter
};
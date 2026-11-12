const route = require("express").Router();
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middleware/authMiddleware");
const {registerSchema,loginSchema} = require("../validations/auth.validation");
const verifyEmailSchema = require("../validations/auth/verifyEmailSchema");
const forgotPasswordSchema = require("../validations/auth/forgotPasswordSchema");
const verifyResetOtpSchema = require("../validations/auth/verifyResetOtpSchema");
const resetPasswordSchema = require("../validations/auth/resetPasswordSchema");
const resendVerificationSchema = require("../validations/auth/resendVerificationSchema")
const validate = require("../middleware/validate");
const rateLimiter = require("../middleware/rateLimiter");
const uploadAvatar = require("../middleware/avatarUpload");
const {
  updateUserSchema,
  userIdParamsSchema,
  userSearchQuerySchema,
} = require("../validations/user.validation");

// public routes
route.post("/verify-email",rateLimiter.verifyOtpLimiter,validate(verifyEmailSchema), UserController.verifyEmail);
route.post("/verify-email/resend",rateLimiter.resendOtpLimiter,validate(resendVerificationSchema), UserController.resendVerificationOTP);
route.post("/refresh-token",UserController.refreshAccessToken);
route.post("/user", rateLimiter.registerLimiter,validate(registerSchema), UserController.AddUser);
route.post("/loginuser",rateLimiter.loginLimiter,validate(loginSchema),UserController.LoginUser);
route.post("/forgot-password",rateLimiter.forgotPasswordLimiter,validate(forgotPasswordSchema),UserController.forgotPassword);
route.post("/verify-reset-otp",rateLimiter.verifyOtpLimiter,validate(verifyResetOtpSchema),UserController.verifyResetOTP);
route.post("/reset-password",rateLimiter.resetPasswordLimiter,validate(resetPasswordSchema),UserController.resetPassword);

// protected routes
route.get(
  "/users",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  UserController.GetAllUsers,
);
route.get(
  "/user/search",
  authMiddleware.verifyToken,
  validate(userSearchQuerySchema),
  UserController.SearchUser,
)
route.get("/user/me",authMiddleware.verifyToken,UserController.GetCurrentUser);
route.post(
  "/user/me/avatar",
  authMiddleware.verifyToken,
  uploadAvatar,
  UserController.UploadAvatar,
);
route.get(
  "/user/:id",
  authMiddleware.verifyToken,
  validate(userIdParamsSchema),
  UserController.GetUserById,
)
route.put(
  "/user/:id",
  authMiddleware.verifyToken,
  validate(updateUserSchema),
  UserController.UpdateUser,
)
route.post("/user/:userId/change-password",authMiddleware.verifyToken,UserController.ChangePassword);
// admin routes
route.delete("/user/:id",authMiddleware.verifyToken,authMiddleware.isAdmin,UserController.DeleteUser)
route.post("/logout",UserController.logout);
module.exports = route;
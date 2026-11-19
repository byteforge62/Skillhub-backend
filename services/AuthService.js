const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require("../utils/jwt");
const UserSettings = require("../models/UserSettingsModel");
const RefreshTokenModel = require("../models/RefreshTokenModel");
const { hashPassword, comparePassword } = require("../utils/password");
const { verifyOTP, generateOTP, hashOTP } = require("../utils/otp");
const { sendVerificationOTP, sendPasswordResetOTP } = require("./EmailService");
const RedisService = require("../services/RedisService");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");

const login = async (email, password, req) => {
  const normalizedEmail = email.trim().toLowerCase();
  // Find user
  const foundUser = await UserModel.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!foundUser) {
    throw new AppError("User not found", 404);
  }

  if (!foundUser.isEmailVerified) {
    throw new AppError("Please verify your email before logging in.", 403);
  }
  // Compare password
  const isMatch = await comparePassword(password, foundUser.password);
  if (!isMatch) {
    throw new AppError("Invalid Email or Password", 400);
  }
  const accessToken = generateAccessToken(foundUser);
  // Generate Session ID
  const sessionId = new mongoose.Types.ObjectId();

  // Generate Refresh Token
  const refreshToken = generateRefreshToken({
    userId: foundUser._id,
    sessionId,
    tokenVersion: foundUser.tokenVersion,
  });

  // Hash Refresh Token
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  // Create Session
  await RefreshTokenModel.create({
    _id: sessionId,
    userId: foundUser._id,
    tokenHash: hashedRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: req.headers["user-agent"] || "Unknown Device",
    ipAddress:
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "",
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: foundUser._id,
      fullname: foundUser.fullname,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.avatar,
    },
  };
};

const logout = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }

  const session = await RefreshTokenModel.findById(payload.sessionId);
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  await session.deleteOne();
  return;
};

const register = async (userData) => {
  const email = userData.email.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already registered. Please login instead.", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await hashPassword(userData.password, salt);

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  const newUser = await UserModel.create({
    ...userData,
    email,
    password: hashedPassword,
    isEmailVerified: false,
  });

  await RedisService.storeEmailVerificationOTP(
    newUser._id.toString(),
    hashedOTP,
  );
  await sendVerificationOTP(newUser.email, newUser.fullname, otp);

  await UserSettings.create({
    userId: newUser._id,
  });

  return {
    email: newUser.email,
    isEmailVerified: newUser.isEmailVerified,
  };
};

const verifyEmail = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const storedOTP = await RedisService.getEmailVerificationOTP(
    user._id.toString(),
  );
  if (!storedOTP) {
    throw new AppError(
      "Verification OTP has expired. Please request a new OTP.",
      400,
    );
  }

  const isValidOTP = verifyOTP(otp, storedOTP);
  if (!isValidOTP) {
    throw new AppError("Invalid verification OTP.", 400);
  }

  user.isEmailVerified = true;
  await user.save();
  await RedisService.deleteEmailVerificationOTP(user._id.toString());

  return {
    email: user.email,
    isEmailVerified: true,
  };
};

const resendVerificationOTP = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({
    email: normalizedEmail,
  }).select("+emailVerificationOtp +emailVerificationExpires");
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified.", 400);
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  await RedisService.storeEmailVerificationOTP(user._id.toString(), hashedOTP);
  await sendVerificationOTP(user.email, user.fullname, otp);

  return {
    email: user.email,
  };
};

const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({
    email: normalizedEmail,
  });
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first.", 400);
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  await RedisService.storePasswordResetOTP(user._id.toString(), hashedOTP);
  await sendPasswordResetOTP(user.email, user.fullname, otp);
  return {
    email: user.email,
  };
};

const verifyResetOTP = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const storedOTP = await RedisService.getPasswordResetOTP(user._id.toString());
  if (!storedOTP) {
    throw new AppError(
      "Password reset OTP has expired. Please request a new OTP.",
      400,
    );
  }

  const isValidOTP = verifyOTP(otp, storedOTP);
  if (!isValidOTP) {
    throw new AppError("Invalid password reset OTP.", 400);
  }

  return {
    email: user.email,
    verified: true,
  };
};

const resetPassword = async ({ email, otp, newPassword }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const storedOTP = await RedisService.getPasswordResetOTP(user._id.toString());

  if (!storedOTP) {
    throw new AppError(
      "Password reset OTP has expired. Please request a new OTP.",
      400,
    );
  }

  const isValidOTP = verifyOTP(otp, storedOTP);

  if (!isValidOTP) {
    throw new AppError("Invalid password reset OTP.", 400);
  }

  const isSamePassword = await comparePassword(newPassword, user.password);

  if (isSamePassword) {
    throw new AppError(
      "New password must be different from the current password.",
      400,
    );
  }

  user.password = await hashPassword(newPassword);
  user.tokenVersion++;

  await user.save();

  await RefreshTokenModel.deleteMany({
    userId: user._id,
  });

  await RedisService.deletePasswordResetOTP(user._id.toString());

  return {
    changedAt: new Date().toISOString(),
  };
};

const refreshAccessToken = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  // Find Session
  const session = await RefreshTokenModel.findById(payload.sessionId).select(
    "+tokenHash",
  );
  if (!session) {
    throw new AppError("Session not found.", 401);
  }
  if (session.isRevoked) {
    throw new AppError("Session has been revoked.", 401);
  }
  if (session.expiresAt < new Date()) {
    throw new AppError("Refresh token expired.", 401);
  }

  // Compare Hash
  const hashedIncomingToken = hashRefreshToken(refreshToken);
  if (hashedIncomingToken !== session.tokenHash) {
    throw new AppError("Invalid refresh token.", 401);
  }

  // Find User
  const user = await UserModel.findById(payload.userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (payload.tokenVersion !== user.tokenVersion) {
    throw new AppError("Your session has expired, Please login again.", 401);
  }

  // Update Session Activity
  session.lastUsedAt = new Date();
  await session.save();
  // Generate New Access Token
  const accessToken = generateAccessToken(user);

  return {
    accessToken,
  };
};

const changePassword = async (
  userId,
  authenticatedUserId,
  currentPassword,
  newPassword,
) => {
  // User can only change their own password
  if (userId !== authenticatedUserId) {
    throw new AppError(
      "Unauthorized: You can only change your own password",
      403,
    );
  }

  if (!currentPassword || !newPassword) {
    throw new AppError("Current password and new password are required", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters long", 400);
  }

  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 400);
  }

  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError(
      "New password must be different from the current password",
      400,
    );
  }

  user.password = await hashPassword(newPassword);
  user.tokenVersion++;

  await user.save();

  await RefreshTokenModel.deleteMany({ userId: user._id });
  return {
    changedAt: new Date().toISOString(),
  };
};

module.exports = {
  login,
  register,
  changePassword,
  verifyEmail,
  resendVerificationOTP,
  refreshAccessToken,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};

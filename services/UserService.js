const UserModel = require("../models/UserModel");
const UserSettingsModel = require("../models/UserSettingsModel");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");
const s3 = require("../config/s3");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");

const profileFields = [
  "fullname",
  "avatar",
  "bio",
  "github",
  "linkedin",
  "twitter",
];
const avatarExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const getUserById = async (id) => {
  const user = await UserModel.findById(id)
    .select(
      "_id fullname email role isEmailVerified avatar bio github linkedin twitter points achievements createdAt updatedAt",
    )
    .populate("achievements");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

const getPublicProfile = async (id, viewerId, viewerRole) => {
  const user = await UserModel.findById(id)
    .select("_id fullname avatar bio github linkedin twitter achievements createdAt")
    .populate("achievements");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isOwner = String(id).toLowerCase() === String(viewerId).toLowerCase();
  if (!isOwner && viewerRole !== "admin") {
    const settings = await UserSettingsModel.findOne({ userId: id }).select(
      "profilePublic",
    );
    if (!settings?.profilePublic) {
      throw new AppError("This profile is private", 403);
    }
  }
  return user;
};

const getAllUsers = async () => {
  const users = await UserModel.find();
  return users;
};

const updateUser = async (id, updateData, actorUserId) => {
  if (
    !actorUserId ||
    String(id).toLowerCase() !== String(actorUserId).toLowerCase()
  ) {
    throw new AppError("Not authorized to update this profile", 403);
  }

  const safeUpdate = Object.fromEntries(
    profileFields
      .filter((field) => updateData[field] !== undefined)
      .map((field) => [field, updateData[field]]),
  );
  if (Object.keys(safeUpdate).length === 0) {
    throw new AppError("At least one profile field is required", 400);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { $set: safeUpdate },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }
  return updatedUser;
};

const uploadAvatar = async (userId, file) => {
  if (!file || !file.buffer) {
    throw new AppError("No avatar file uploaded", 400);
  }

  const extension = avatarExtensions[file.mimetype];
  if (!extension) {
    throw new AppError("Avatar must be a JPEG, PNG, or WebP image", 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new AppError("Avatar must be 5 MB or smaller", 413);
  }

  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (
    !bucket ||
    !region ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    throw new AppError("Avatar storage is not configured", 503);
  }

  const key = `profile-avatars/${userId}/${randomUUID()}.${extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const avatar = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return updateUser(userId, { avatar }, userId);
};

const deleteUser = async (id) => {
  const deletedUser = await UserModel.findByIdAndDelete(id);
  if (!deletedUser) {
    throw new AppError("User not found", 404);
  }
  return deletedUser;
};

const searchUsers = async (query) => {
  if (!query) {
    return [];
  }
  const safeQuery = new RegExp(escapeRegex(query), "i");
  const users = await UserModel.find({
    $or: [
      { fullname: safeQuery },
      { email: safeQuery },
    ],
  })
    .select("_id fullname avatar")
    .limit(20);
  return users;
};

module.exports = {
  getUserById,
  getPublicProfile,
  getAllUsers,
  updateUser,
  uploadAvatar,
  deleteUser,
  searchUsers,
};

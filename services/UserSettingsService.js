const UserSettingsModel = require("../models/UserSettingsModel");
const AppError = require("../utils/AppError");

const settingFields = [
  "profilePublic",
  "showActivity",
  "showProgress",
  "theme",
  "animationsEnabled",
  "compactMode",
  "emailNotifications",
  "pushNotifications",
  "courseUpdates",
  "achievementAlerts",
  "marketingEmails",
];

const getUserSettings = async (userId) => {
  let settings = await UserSettingsModel.findOne({
    userId,
  });

  if (!settings) {
    settings = await UserSettingsModel.create({
      userId,
    });
  }

  return settings;
};

const updateUserSettings = async (userId, updateData) => {
  const safeUpdate = Object.fromEntries(
    settingFields
      .filter((field) => updateData[field] !== undefined)
      .map((field) => [field, updateData[field]]),
  );
  if (Object.keys(safeUpdate).length === 0) {
    throw new AppError("At least one setting is required", 400);
  }

  const settings = await UserSettingsModel.findOneAndUpdate(
    {
      userId,
    },
    {
      $set: safeUpdate,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );

  return settings;
};

module.exports = {
  getUserSettings,
  updateUserSettings,
};

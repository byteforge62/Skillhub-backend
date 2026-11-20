const UserSettingsModel = require("../models/UserSettingsModel");
const AppError = require("../utils/AppError");

const settingFields = [
  "profilePublic",
  "showActivity",
  "showProgress",
  "showInLeaderboard",
  "allowCommunityMessages",
  "theme",
  "animationsEnabled",
  "compactMode",
  "fontScale",
  "sidebarCompact",
  "defaultHome",
  "weeklyGoalMinutes",
  "autoplayNextLesson",
  "notesAutosave",
  "showLessonNotes",
  "language",
  "timezone",
  "startWeekOnMonday",
  "emailNotifications",
  "pushNotifications",
  "courseUpdates",
  "achievementAlerts",
  "weeklyDigest",
  "dailyReminder",
  "reminderTime",
  "communityReplies",
  "marketingEmails",
];

/**
 * Defaults mirrored from the schema so the UI can offer a real reset without
 * writing one request per field.
 */
const defaultSettings = {
  profilePublic: false,
  showActivity: true,
  showProgress: true,
  showInLeaderboard: true,
  allowCommunityMessages: true,
  theme: "light",
  animationsEnabled: true,
  compactMode: false,
  fontScale: "md",
  sidebarCompact: false,
  defaultHome: "dashboard",
  weeklyGoalMinutes: 180,
  autoplayNextLesson: true,
  notesAutosave: true,
  showLessonNotes: true,
  language: "English",
  timezone: "GMT",
  startWeekOnMonday: true,
  emailNotifications: true,
  pushNotifications: true,
  courseUpdates: true,
  achievementAlerts: true,
  weeklyDigest: true,
  dailyReminder: false,
  reminderTime: "18:00",
  communityReplies: true,
  marketingEmails: false,
};

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

const resetUserSettings = async (userId) => {
  const settings = await UserSettingsModel.findOneAndUpdate(
    { userId },
    { $set: defaultSettings },
    { new: true, upsert: true, runValidators: true },
  );

  return settings;
};

module.exports = {
  settingFields,
  defaultSettings,
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
};

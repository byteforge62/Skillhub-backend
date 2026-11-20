const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSettingsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /* ---------------------------------------------------------------
       Privacy
       --------------------------------------------------------------- */
    profilePublic: {
      type: Boolean,
      default: false,
    },

    showActivity: {
      type: Boolean,
      default: true,
    },

    showProgress: {
      type: Boolean,
      default: true,
    },

    showInLeaderboard: {
      type: Boolean,
      default: true,
    },

    allowCommunityMessages: {
      type: Boolean,
      default: true,
    },

    /* ---------------------------------------------------------------
       Appearance
       --------------------------------------------------------------- */
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },

    animationsEnabled: {
      type: Boolean,
      default: true,
    },

    compactMode: {
      type: Boolean,
      default: false,
    },

    fontScale: {
      type: String,
      enum: ["sm", "md", "lg"],
      default: "md",
    },


    sidebarCompact: {
      type: Boolean,
      default: false,
    },

    /* ---------------------------------------------------------------
       Learning
       --------------------------------------------------------------- */
    defaultHome: {
      type: String,
      enum: ["dashboard", "learning", "courses", "studio"],
      default: "dashboard",
    },

    weeklyGoalMinutes: {
      type: Number,
      min: 30,
      max: 2400,
      default: 180,
    },

    autoplayNextLesson: {
      type: Boolean,
      default: true,
    },

    notesAutosave: {
      type: Boolean,
      default: true,
    },

    showLessonNotes: {
      type: Boolean,
      default: true,
    },

    language: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "English",
    },

    timezone: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "GMT",
    },

    startWeekOnMonday: {
      type: Boolean,
      default: true,
    },

    /* ---------------------------------------------------------------
       Notifications
       --------------------------------------------------------------- */
    emailNotifications: {
      type: Boolean,
      default: true,
    },

    pushNotifications: {
      type: Boolean,
      default: true,
    },

    courseUpdates: {
      type: Boolean,
      default: true,
    },

    achievementAlerts: {
      type: Boolean,
      default: true,
    },

    weeklyDigest: {
      type: Boolean,
      default: true,
    },

    dailyReminder: {
      type: Boolean,
      default: false,
    },

    reminderTime: {
      type: String,
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Reminder time must be HH:mm"],
      default: "18:00",
    },

    communityReplies: {
      type: Boolean,
      default: true,
    },

    marketingEmails: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("UserSettings", UserSettingsSchema);

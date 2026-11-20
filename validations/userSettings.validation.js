const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const paramsSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

const bodySettingsSchema = z.object({
  profilePublic: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showInLeaderboard: z.boolean().optional(),
  allowCommunityMessages: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  animationsEnabled: z.boolean().optional(),
  compactMode: z.boolean().optional(),
  fontScale: z.enum(["sm", "md", "lg"]).optional(),
  sidebarCompact: z.boolean().optional(),
  defaultHome: z.enum(["dashboard", "learning", "courses", "studio"]).optional(),
  weeklyGoalMinutes: z.number().int().min(30).max(2400).optional(),
  autoplayNextLesson: z.boolean().optional(),
  notesAutosave: z.boolean().optional(),
  showLessonNotes: z.boolean().optional(),
  language: z.string().trim().min(1).max(40).optional(),
  timezone: z.string().trim().min(1).max(60).optional(),
  startWeekOnMonday: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  courseUpdates: z.boolean().optional(),
  achievementAlerts: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  dailyReminder: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Reminder time must be HH:mm")
    .optional(),
  communityReplies: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

const updateSettingsSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
  body: bodySettingsSchema.refine((data) => Object.keys(data).length > 0, {
    message: "At least one setting is required",
  }),
});

module.exports = {
  paramsSchema,
  updateSettingsSchema,
};

const route = require("express").Router();
const UserSettings = require("../controllers/UserSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  paramsSchema,
  updateSettingsSchema,
} = require("../validations/userSettings.validation");

route.get(
  "/user/:userId/settings",
  authMiddleware.verifyToken,
  validate(paramsSchema),
  UserSettings.getUserSettings,
);
route.put(
  "/user/:userId/settings",
  authMiddleware.verifyToken,
  validate(updateSettingsSchema),
  UserSettings.updateUserSettings,
);
route.post(
  "/user/:userId/settings/reset",
  authMiddleware.verifyToken,
  validate(paramsSchema),
  UserSettings.resetUserSettings,
);
module.exports = route;
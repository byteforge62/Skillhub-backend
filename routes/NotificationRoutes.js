const route = require("express").Router()
const NotificationController = require("../controllers/NotificationController")
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const {
  userIdParamsSchema,
  notificationIdParamsSchema,
} = require("../validations/notification.validation")
route.get(
  "/:userId",
  authMiddleware.verifyToken,
  validate(userIdParamsSchema),
  NotificationController.AllNotificationForUser,
)
route.patch(
  "/:id/read",
  authMiddleware.verifyToken,
  validate(notificationIdParamsSchema),
  NotificationController.ReadMessage,
)
module.exports = route
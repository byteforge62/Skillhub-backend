const NotificationService = require("../services/NotificationService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");
const AppError = require("../utils/AppError");

const sameId = (left, right) =>
  String(left).toLowerCase() === String(right).toLowerCase();

const AllNotificationForUser = catchAsync(async (req, res) => {
  if (!sameId(req.validated.params.userId, req.user.id)) {
    throw new AppError("Not authorized to view these notifications", 403);
  }
  const notifications = await NotificationService.getNotificationsForUser(
    req.user.id,
  );

  return ResponseHandler.success(
    res,
    "Notifications fetched successfully",
    notifications,
  );
});

const ReadMessage = catchAsync(async (req, res) => {
  const notification = await NotificationService.markAsRead(
    req.validated.params.id,
    req.user.id,
  );

  return ResponseHandler.success(
    res,
    "Notification marked as read",
    notification,
  );
});

module.exports = {
  AllNotificationForUser,
  ReadMessage,
};

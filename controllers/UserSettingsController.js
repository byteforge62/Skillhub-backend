const UserSettingsService = require("../services/UserSettingsService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");
const AppError = require("../utils/AppError");

const requireOwner = (req) => {
  if (req.params.userId.toLowerCase() !== req.user.id.toLowerCase()) {
    throw new AppError("Not authorized to access these settings", 403);
  }
};

const getUserSettings = catchAsync(async (req, res) => {
  requireOwner(req);
  const settings = await UserSettingsService.getUserSettings(req.user.id);

  return ResponseHandler.success(
    res,
    "User settings fetched successfully",
    settings,
  );
});

const updateUserSettings = catchAsync(async (req, res) => {
  requireOwner(req);
  const settings = await UserSettingsService.updateUserSettings(
    req.user.id,
    req.validated.body,
  );

  return ResponseHandler.success(
    res,
    "User settings updated successfully",
    settings,
  );
});

module.exports = {
  getUserSettings,
  updateUserSettings,
};

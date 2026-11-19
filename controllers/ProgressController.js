const ProgressService = require("../services/ProgressService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");
const AppError = require("../utils/AppError");

const SaveProgress = catchAsync(async (req, res) => {
  const progress = await ProgressService.saveProgress(
    req.user.id,
    req.validated.body,
  );

  return ResponseHandler.success(res, "Progress saved successfully", progress);
});

const GetProgress = catchAsync(async (req, res) => {
  const requestedUserId = req.validated.params.userId;
  if (
    req.user.role !== "admin" &&
    requestedUserId.toLowerCase() !== req.user.id.toLowerCase()
  ) {
    throw new AppError("Not authorized to view this progress", 403);
  }

  const progress = await ProgressService.getProgress(
    requestedUserId,
    req.validated.params.courseId,
  );

  return ResponseHandler.success(
    res,
    "Progress fetched successfully",
    progress,
  );
});

module.exports = {
  SaveProgress,
  GetProgress,
};

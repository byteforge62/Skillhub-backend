const FeedbackService = require("../services/FeedbackService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddFeedback = catchAsync(async (req, res) => {
  const feedback = await FeedbackService.addFeedback(req.body);

  return ResponseHandler.success(
    res,
    "Feedback added successfully",
    feedback,
    201,
  );
});

const GetFeedbackByCourse = catchAsync(async (req, res) => {
  const result = await FeedbackService.getFeedbackByCourse(req.params.courseId);

  return ResponseHandler.success(res, "Feedback fetched successfully", result);
});

const GetFeedbackByUser = catchAsync(async (req, res) => {
  const result = await FeedbackService.getFeedbackByUser(req.params.userId);

  return ResponseHandler.success(res, "Feedback fetched successfully", result);
});

module.exports = {
  AddFeedback,
  GetFeedbackByCourse,
  GetFeedbackByUser,
};

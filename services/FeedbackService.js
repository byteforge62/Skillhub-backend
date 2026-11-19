const FeedbackModel = require("../models/FeedbackModel");
const AppError = require("../utils/AppError");

const addFeedback = async (feedbackData) => {
  const feedback = await FeedbackModel.create(feedbackData);

  return feedback;
};

const getFeedbackByCourse = async (courseId) => {
  const feedback = await FeedbackModel.find({
    courseId,
  })
    .populate("userId", "fullname email")
    .sort({ createdAt: -1 });

  const averageRating =
    feedback.length > 0
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
      : 0;

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalFeedback: feedback.length,
    feedback,
  };
};

const getFeedbackByUser = async (userId) => {
  const feedback = await FeedbackModel.find({
    userId,
  }).populate("courseId", "title");

  return {
    totalFeedback: feedback.length,
    feedback,
  };
};

module.exports = {
  addFeedback,
  getFeedbackByCourse,
  getFeedbackByUser,
};

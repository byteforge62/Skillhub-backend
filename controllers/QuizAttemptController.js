const QuizAttemptService = require("../services/QuizAttemptService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const SubmitQuizAttempt = catchAsync(async (req, res) => {
  const attempt = await QuizAttemptService.submitQuizAttempt(req.validated.params.quizId,req.user.id,req.validated.body.answers);
  return ResponseHandler.success(res,"Quiz submitted successfully",attempt,201);
});

const GetAttemptById = catchAsync(async (req, res) => {
  const attempt = await QuizAttemptService.getAttemptById(req.validated.params.attemptId,req.user.id);
  return ResponseHandler.success(res,"Quiz attempt fetched successfully",attempt);
});

const GetMyAttemptsByQuiz = catchAsync(async (req, res) => {
  const attempts = await QuizAttemptService.getMyAttemptsByQuiz(req.validated.params.quizId,req.user.id);
  return ResponseHandler.success(res,"Quiz attempts fetched successfully",attempts);
});

module.exports = {
  SubmitQuizAttempt,
  GetAttemptById,
  GetMyAttemptsByQuiz,
};
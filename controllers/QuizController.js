const QuizService = require("../services/QuizService");

const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const CreateQuiz = catchAsync(async (req, res) => {
  const quiz = await QuizService.createQuiz(req.user.id,req.validated.body);
  return ResponseHandler.success(res,"Quiz created successfully",quiz,201);
});

const GetQuizzesByCourse = catchAsync(async (req, res) => {
  const quizzes = await QuizService.getQuizzesByCourse(req.validated.params.courseId);
  return ResponseHandler.success(res,"Quizzes fetched successfully",quizzes);
});

const GetQuizById = catchAsync(async (req, res) => {
  const quiz = await QuizService.getQuizById(req.validated.params.quizId);
  return ResponseHandler.success(res,"Quiz fetched successfully",quiz);
});

const GetMyQuizzes = catchAsync(async (req, res) => {
  const quizzes = await QuizService.getMyQuizzes(req.user.id);

  return ResponseHandler.success(res,"Your quizzes fetched successfully",quizzes);
});

const UpdateQuiz = catchAsync(async (req, res) => {
  const quiz = await QuizService.updateQuiz(req.validated.params.quizId,req.user.id,req.validated.body);
  return ResponseHandler.success(res,"Quiz updated successfully",quiz);
});

const PublishQuiz = catchAsync(async (req, res) => {
  const quiz = await QuizService.publishQuiz(req.validated.params.quizId,req.user.id);
  return ResponseHandler.success(res,"Quiz published successfully",quiz);
});

const DeleteQuiz = catchAsync(async (req, res) => {
  await QuizService.deleteQuiz(req.validated.params.quizId,req.user.id);
  return ResponseHandler.success(res,"Quiz deleted successfully",null);
});

module.exports = {
  CreateQuiz,
  GetQuizzesByCourse,
  GetQuizById,
  GetMyQuizzes,
  UpdateQuiz,
  PublishQuiz,
  DeleteQuiz,
};
const QuestionService = require("../services/QuestionService");

const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const CreateQuestion = catchAsync(async (req, res) => {
  const question = await QuestionService.createQuestion(req.user.id,{...req.validated.body,quiz:req.validated.params.quizId});
  return ResponseHandler.success(res,"Question created successfully",question,201);
});

const GetQuestionsByQuiz = catchAsync(async (req, res) => {
  const questions = await QuestionService.getQuestionsByQuiz(req.validated.params.quizId);
  return ResponseHandler.success(res,"Questions fetched successfully",questions);
});

const GetMyQuestions = catchAsync(async (req, res) => {
  const questions = await QuestionService.getMyQuestions(req.validated.params.quizId,req.user.id);
  return ResponseHandler.success(res,"Your questions fetched successfully",questions);
});

const UpdateQuestion = catchAsync(async (req, res) => {
  const question = await QuestionService.updateQuestion(req.validated.params.questionId,req.user.id,req.validated.body);
  return ResponseHandler.success(res,"Question updated successfully",question);
});

const DeleteQuestion = catchAsync(async (req, res) => {
  await QuestionService.deleteQuestion(req.validated.params.questionId,req.user.id);
  return ResponseHandler.success(res,"Question deleted successfully",null);
});

module.exports = {
  CreateQuestion,
  GetQuestionsByQuiz,
  GetMyQuestions,
  UpdateQuestion,
  DeleteQuestion,
};
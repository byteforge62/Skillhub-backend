const route = require("express").Router();

const QuestionController = require("../controllers/QuestionController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {createQuestionSchema,updateQuestionSchema,quizQuestionsQuerySchema,questionQuerySchema} = require("../validations/question.validation");

route.post("/quizzes/:quizId/questions",authMiddleware.verifyToken,validate(createQuestionSchema),QuestionController.CreateQuestion);
route.get("/quizzes/:quizId/questions",authMiddleware.verifyToken,validate(quizQuestionsQuerySchema),QuestionController.GetQuestionsByQuiz);
route.get("/quizzes/:quizId/questions/me",authMiddleware.verifyToken,validate(quizQuestionsQuerySchema),QuestionController.GetMyQuestions);
route.patch("/questions/:questionId",authMiddleware.verifyToken,validate(updateQuestionSchema),QuestionController.UpdateQuestion);
route.delete("/questions/:questionId",authMiddleware.verifyToken,validate(questionQuerySchema),QuestionController.DeleteQuestion);

module.exports = route;
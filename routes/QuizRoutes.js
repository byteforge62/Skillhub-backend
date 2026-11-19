const route = require("express").Router();

const QuizController = require("../controllers/QuizController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {createQuizSchema,updateQuizSchema,quizQuerySchema,courseQuizQuerySchema} = require("../validations/quiz.validation");

route.post("/quizzes",authMiddleware.verifyToken,validate(createQuizSchema),QuizController.CreateQuiz);
route.get("/courses/:courseId/quizzes",authMiddleware.verifyToken,validate(courseQuizQuerySchema),QuizController.GetQuizzesByCourse);
route.get("/quizzes/me",authMiddleware.verifyToken,QuizController.GetMyQuizzes);
route.get("/quizzes/:quizId",authMiddleware.verifyToken,validate(quizQuerySchema),QuizController.GetQuizById);
route.patch("/quizzes/:quizId",authMiddleware.verifyToken,validate(updateQuizSchema),QuizController.UpdateQuiz);
route.patch("/quizzes/:quizId/publish",authMiddleware.verifyToken,validate(quizQuerySchema),QuizController.PublishQuiz);
route.delete("/quizzes/:quizId",authMiddleware.verifyToken,validate(quizQuerySchema),QuizController.DeleteQuiz);

module.exports = route;
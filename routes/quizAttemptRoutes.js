const route = require("express").Router();

const QuizAttemptController = require("../controllers/QuizAttemptController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {submitQuizAttemptSchema,attemptQuerySchema,quizAttemptsQuerySchema} = require("../validations/quizAttempt.validation");

route.post("/quizzes/:quizId/attempts",authMiddleware.verifyToken,validate(submitQuizAttemptSchema),QuizAttemptController.SubmitQuizAttempt);
route.get("/quiz-attempts/:attemptId",authMiddleware.verifyToken,validate(attemptQuerySchema),QuizAttemptController.GetAttemptById);
route.get("/quizzes/:quizId/attempts/me",authMiddleware.verifyToken,validate(quizAttemptsQuerySchema),QuizAttemptController.GetMyAttemptsByQuiz);

module.exports = route;
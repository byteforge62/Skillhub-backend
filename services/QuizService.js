const QuizModel = require("../models/QuizModel");
const CourseModel = require("../models/CoursesModel");
const QuestionModel = require("../models/QuestionModel");

const AppError = require("../utils/AppError");

const verifyCourseOwnership = async (courseId, userId) => {
  const course = await CourseModel.findById(courseId).select("createdBy");
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to manage quizzes for this course",403);
  }
  return course;
};

const createQuiz = async (userId, quizData) => {
  const { course, title, description, passingScore } = quizData;

  await verifyCourseOwnership(course, userId);
  return await QuizModel.create({
    course,
    title,
    description,
    passingScore,
    createdBy: userId,
    status: "draft",
  });
};

const getQuizzesByCourse = async (courseId) => {
  return await QuizModel.find({
    course: courseId,
    status: "published",
  })
    .populate("createdBy", "fullname email")
    .sort({ createdAt: -1 });
};

const getQuizById = async (quizId) => {
  const quiz = await QuizModel.findOne({
    _id: quizId,
    status: "published",
  }).populate("createdBy", "fullname email");

  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }
  return quiz;
};

const getMyQuizzes = async (userId) => {
  return await QuizModel.find({
    createdBy: userId,
  })
    .populate("course", "title")
    .sort({ createdAt: -1 });
};

const updateQuiz = async (quizId, userId, updateData) => {
  const quiz = await QuizModel.findById(quizId);
  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  if (quiz.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to manage this quiz",403);
  }

  return await QuizModel.findByIdAndUpdate(
    quizId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};

const publishQuiz = async (quizId, userId) => {
  const quiz = await QuizModel.findById(quizId);
  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  if (quiz.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to publish this quiz",403);
  }

  if (quiz.status === "published") {
    throw new AppError("Quiz is already published", 400);
  }

  const questionCount = await QuestionModel.countDocuments({
    quiz: quizId,
  });

  if (questionCount === 0) {
    throw new AppError("Quiz must have at least one question before it can be published",400);
  }

  quiz.status = "published";

  await quiz.save();
  return quiz;
};

const deleteQuiz = async (quizId, userId) => {
  const quiz = await QuizModel.findById(quizId);

  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  if (quiz.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to delete this quiz",403);
  }

  await QuestionModel.deleteMany({quiz: quizId});
  await QuizModel.findByIdAndDelete(quizId);
};

module.exports = {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  getMyQuizzes,
  updateQuiz,
  publishQuiz,
  deleteQuiz,
};
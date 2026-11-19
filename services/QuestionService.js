const QuestionModel = require("../models/QuestionModel");
const QuizModel = require("../models/QuizModel");
const AppError = require("../utils/AppError");

const verifyQuizOwnership = async (quizId, userId) => {
  const quiz = await QuizModel.findById(quizId).select("course createdBy");

  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  if (quiz.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to manage questions for this quiz",403);
  }

  return quiz;
};

const createQuestion = async (userId, questionData) => {
  const { quiz, question, options, points, order } = questionData;

  await verifyQuizOwnership(quiz, userId);

  const existingQuestion = await QuestionModel.findOne({quiz,order,});

  if (existingQuestion) {
    throw new AppError(`Question order ${order} is already in use for this quiz`,409);
  }

  return await QuestionModel.create({
    quiz,
    question,
    options,
    points,
    order,
  });
};

const getQuestionsByQuiz = async (quizId) => {
  const quiz = await QuizModel.findOne({_id: quizId,status: "published"}).select("_id");
  if (!quiz) throw new AppError("Quiz not found", 404);

  const questions = await QuestionModel.find({quiz: quizId}).sort({ order: 1 }).lean();

  return questions.map((question) => ({
    _id: question._id,
    quiz: question.quiz,
    question: question.question,
    options: question.options.map((option) => ({
      _id: option._id,
      text: option.text,
    })),
    points: question.points,
    order: question.order,
  }));
};

const getMyQuestions = async (quizId, userId) => {
  await verifyQuizOwnership(quizId, userId);

  return await QuestionModel.find({
    quiz: quizId,
  }).sort({ order: 1 });
};

const updateQuestion = async (questionId, userId, updateData) => {
  const question = await QuestionModel.findById(questionId);

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  await verifyQuizOwnership(question.quiz, userId);

  if (updateData.order !== undefined) {
    const duplicateOrder = await QuestionModel.findOne({
      quiz: question.quiz,
      order: updateData.order,
      _id: { $ne: questionId },
    });
    if (duplicateOrder) {
      throw new AppError(`Question order ${updateData.order} is already in use for this quiz`,409);
    }
  }

  return await QuestionModel.findByIdAndUpdate(
    questionId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteQuestion = async (questionId, userId) => {
  const question = await QuestionModel.findById(questionId);
  if (!question) {
    throw new AppError("Question not found", 404);
  }

  await verifyQuizOwnership(question.quiz, userId);
  await QuestionModel.findByIdAndDelete(questionId);
};

module.exports = {
  createQuestion,
  getQuestionsByQuiz,
  getMyQuestions,
  updateQuestion,
  deleteQuestion,
};
const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuizAttemptAnswerSchema = new Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    selectedOption: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: {
      type: [QuizAttemptAnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

QuizAttemptSchema.index({ quiz: 1, user: 1, createdAt: -1 });

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
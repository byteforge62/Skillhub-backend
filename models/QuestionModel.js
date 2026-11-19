const mongoose = require("mongoose");

const { Schema } = mongoose;

const QuestionOptionSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    isCorrect: {
      type: Boolean,
      required: true,
    },

    explanation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const QuestionSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },

    options: {
      type: [QuestionOptionSchema],
      required: true,
    },

    points: {
      type: Number,
      default: 1,
      min: 1,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ quiz: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Question", QuestionSchema);
const mongoose = require("mongoose");

const { Schema } = mongoose;

const QuizSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    passingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 60,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model("Quiz", QuizSchema);
const mongoose = require("mongoose");
const { Schema } = mongoose;

const EnrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "dropped", "cancelled"],
      default: "active",
      index: true,
    },

    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

EnrollmentSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
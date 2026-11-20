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

    /**
     * Where the learner stopped. Kept alongside the derived "next lesson" so
     * the workspace can resume on the exact lesson instead of guessing.
     */
    lastAccessedLesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    lastAccessedAt: {
      type: Date,
      default: null,
    },

    /** Workspace bookmark for the track (Frame 81 "Saved" action). */
    saved: {
      type: Boolean,
      default: false,
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

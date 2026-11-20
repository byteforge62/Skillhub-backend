const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * One private note per lesson per enrollment. Kept in its own collection so
 * the enrollment document stays small and notes can be read/written on their
 * own, which is all the workspace spotlight needs.
 */
const LessonNoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
      index: true,
    },

    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: [5000, "A note cannot exceed 5000 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

LessonNoteSchema.index({ enrollmentId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("LessonNote", LessonNoteSchema);

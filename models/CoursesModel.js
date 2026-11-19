const mongoose = require("mongoose");

const { Schema } = mongoose;

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Course title must be at least 3 characters"],
      maxlength: [150, "Course title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [20, "Course description must be at least 20 characters"],
      maxlength: [2000, "Course description cannot exceed 2000 characters"],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course creator is required"],
      index: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Course category is required"],
      index: true,
    },

    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },

    price: {
      type: Number,
      min: [0, "Course price cannot be negative"],
      default: 0,
    },

    duration: {
      type: Number,
      required: [true, "Course duration is required"],
      min: [1, "Course duration must be greater than 0"],
    },

    level: {
      type: String,
      enum: {
        values: ["Beginner", "Intermediate", "Advanced"],
        message: "Invalid course level",
      },
      default: "Beginner",
    },

    language: {
      type: String,
      trim: true,
      maxlength: [50, "Language cannot exceed 50 characters"],
      default: "English",
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 10,
        message: "A course cannot have more than 10 tags",
      },
    },

    overview: {
      type: String,
      trim: true,
      maxlength: [3000, "Course overview cannot exceed 3000 characters"],
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Invalid course status",
      },
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

CourseSchema.index({ createdBy: 1, status: 1 });
CourseSchema.index({ category: 1, status: 1 });
CourseSchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Course", CourseSchema);
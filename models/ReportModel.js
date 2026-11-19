const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportSchema = Schema(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bug", "abuse", "inappropriate"],
      required: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["open", "reviewing", "closed"],
      default: "open",
    },
    targetType: {
      type: String,
      enum: ["Course", "User", "Post", "Comment"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType", // ✅ dynamic reference
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // admin who closed it
    },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Report", ReportSchema);

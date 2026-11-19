const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "instructor", "user"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tokenVersion: {
      type: Number,
      default:0,
    },
    points: {
      type: Number,
      default: 0,
    },
    achievements: [
      {
        type: Schema.Types.ObjectId,
        ref: "Achievement",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("User", UserSchema);

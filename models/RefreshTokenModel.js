const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    tokenVersion:{
      type: Number,
      default: 0,
    },
    
    tokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    deviceInfo: {
      type: String,
      default: "Unknown Device",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);

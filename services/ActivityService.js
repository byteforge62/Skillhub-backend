const Activity = require("../models/ActivityLogModel");
const AppError = require("../utils/AppError");

const getActivitiesByUserId = async (userId) => {
  const activities = await Activity.find({ userId }).sort({ createdAt: -1 });
  return activities;
};

module.exports = { getActivitiesByUserId };
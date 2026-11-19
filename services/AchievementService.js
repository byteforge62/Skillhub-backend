const AchievementModel = require("../models/AchievementModel");
const UserModel = require("../models/UserModel");
const AppError = require("../utils/AppError");

const createAchievement = async ({ name, icon, pointsRequired }) => {
  const achievement = await AchievementModel.create({
    name,
    icon,
    pointsRequired,
  });

  return achievement;
};

const checkAchievement = async (userId) => {
  let user = await UserModel.findById(userId).populate("achievements");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const allAchievements = await AchievementModel.find();
  let newlyUnlocked = [];

  for (const ach of allAchievements) {
    const alreadyHas = user.achievements.some(
      (a) => a._id.toString() === ach._id.toString()
    );

    if (user.points >= ach.pointsRequired && !alreadyHas) {
      user.achievements.push(ach._id); // push ID not object
      newlyUnlocked.push(ach);
    }
  }

  await user.save();

  // Re-fetch with populated achievements
  user = await UserModel.findById(userId).populate("achievements");

  return {
    newlyUnlocked,
    achievements: user.achievements,
  };
};

const getUserAchievements = async (userId) => {
  const user = await UserModel.findById(userId).populate("achievements");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user.achievements;
};

const getAchievements = async () => {
  const allAchievements = await AchievementModel.find();
  return allAchievements;
};

module.exports = {
  createAchievement,
  checkAchievement,
  getUserAchievements,
  getAchievements,
};

const route = require("express").Router();
const AchievementController = require("../controllers/AchievementController");
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validate");
const {
  userIdParamsSchema,
  createAchievementSchema,
} = require("../validations/achievement.validation");

route.post("/achievement",authMiddleware.verifyToken,authMiddleware.isAdmin,validate(createAchievementSchema), AchievementController.CreateAchievement);
route.get("/achievements",authMiddleware.verifyToken, AchievementController.GetAchievements);
route.post("/check/:userId",authMiddleware.verifyToken,validate(userIdParamsSchema), AchievementController.CheckAchievement);
route.get("/achievement/:userId",authMiddleware.verifyToken,validate(userIdParamsSchema), AchievementController.GetUserAchievements);

module.exports = route;

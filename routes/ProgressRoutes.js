const route = require("express").Router()
const ProgressController = require("../controllers/ProgressController")
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validate");
const {
  saveProgressSchema,
  getProgressParamsSchema,
} = require("../validations/progress.validation");

route.post(
  "/save",
  authMiddleware.verifyToken,
  validate(saveProgressSchema),
  ProgressController.SaveProgress,
)
route.get(
  "/:userId/:courseId",
  authMiddleware.verifyToken,
  validate(getProgressParamsSchema),
  ProgressController.GetProgress,
)
module.exports = route
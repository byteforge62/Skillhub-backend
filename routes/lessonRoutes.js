const route = require("express").Router();

const LessonController = require("../controllers/LessonController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {createLessonSchema,updateLessonSchema,} = require("../validations/lesson.validation");

route.post("/sections/:sectionId/lessons",authMiddleware.verifyToken,validate(createLessonSchema),LessonController.CreateLesson,);
route.get("/sections/:sectionId/lessons",authMiddleware.verifyToken,LessonController.GetSectionLessons,);
route.get("/lessons/:lessonId",authMiddleware.verifyToken,LessonController.GetLessonById,);
route.patch("/lessons/:lessonId",authMiddleware.verifyToken,validate(updateLessonSchema),LessonController.UpdateLesson,);
route.patch("/lessons/:lessonId/publish",authMiddleware.verifyToken,LessonController.PublishLesson,);
route.delete("/lessons/:lessonId",authMiddleware.verifyToken,LessonController.DeleteLesson,);

module.exports = route;
const route = require("express").Router();

const EnrollmentController = require("../controllers/EnrollmentController");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  createEnrollmentSchema,
  enrollmentIdParamsSchema,
  completeLessonParamsSchema,
  lessonNoteSchema,
} = require("../validations/enrollment.validation");

route.post("/enrollments",authMiddleware.verifyToken,validate(createEnrollmentSchema),EnrollmentController.EnrollInCourse);
route.get("/enrollments/me",authMiddleware.verifyToken,EnrollmentController.GetMyEnrollments);
route.get("/enrollments/:enrollmentId",authMiddleware.verifyToken,validate(enrollmentIdParamsSchema),EnrollmentController.GetMyEnrollmentById);
route.patch("/enrollments/:enrollmentId/lessons/:lessonId/complete",authMiddleware.verifyToken,validate(completeLessonParamsSchema),EnrollmentController.CompleteLesson);
route.patch("/enrollments/:enrollmentId/drop",authMiddleware.verifyToken,validate(enrollmentIdParamsSchema),EnrollmentController.DropCourse);
route.patch("/enrollments/:enrollmentId/saved",authMiddleware.verifyToken,validate(enrollmentIdParamsSchema),EnrollmentController.ToggleSaved);
route.get("/enrollments/:enrollmentId/lessons/:lessonId/note",authMiddleware.verifyToken,validate(completeLessonParamsSchema),EnrollmentController.GetLessonNote);
route.put("/enrollments/:enrollmentId/lessons/:lessonId/note",authMiddleware.verifyToken,validate(lessonNoteSchema),EnrollmentController.SaveLessonNote);

module.exports = route;
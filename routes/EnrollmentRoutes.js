const route = require("express").Router();

const EnrollmentController = require("../controllers/EnrollmentController");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  createEnrollmentSchema,
  enrollmentIdParamsSchema,
  completeLessonParamsSchema,
} = require("../validations/enrollment.validation");

route.post("/enrollments",authMiddleware.verifyToken,validate(createEnrollmentSchema),EnrollmentController.EnrollInCourse);
route.get("/enrollments/me",authMiddleware.verifyToken,EnrollmentController.GetMyEnrollments);
route.get("/enrollments/:enrollmentId",authMiddleware.verifyToken,validate(enrollmentIdParamsSchema),EnrollmentController.GetMyEnrollmentById);
route.patch("/enrollments/:enrollmentId/lessons/:lessonId/complete",authMiddleware.verifyToken,validate(completeLessonParamsSchema),EnrollmentController.CompleteLesson);
route.patch("/enrollments/:enrollmentId/drop",authMiddleware.verifyToken,validate(enrollmentIdParamsSchema),EnrollmentController.DropCourse);

module.exports = route;
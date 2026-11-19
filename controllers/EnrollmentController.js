const EnrollmentService = require("../services/EnrollmentService");

const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const EnrollInCourse = catchAsync(async (req, res) => {
  const enrollment = await EnrollmentService.enrollInCourse(req.user.id,req.validated.body.courseId);
  return ResponseHandler.success(res,"Course enrollment successful",enrollment,201);
});

const GetMyEnrollments = catchAsync(async (req, res) => {
  const enrollments = await EnrollmentService.getMyEnrollments(req.user.id);
  return ResponseHandler.success(res,"Your enrollments fetched successfully",enrollments);
});

const GetMyEnrollmentById = catchAsync(async (req, res) => {
  const enrollment =
    await EnrollmentService.getMyEnrollmentById(req.validated.params.enrollmentId,req.user.id);
    return ResponseHandler.success(res,"Enrollment fetched successfully",enrollment);
});

const CompleteLesson = catchAsync(async (req, res) => {
  const { enrollmentId, lessonId } = req.validated.params;
  const enrollment = await EnrollmentService.completeLesson(enrollmentId,lessonId,req.user.id);
  return ResponseHandler.success(res,"Lesson marked as completed",enrollment);
});

const DropCourse = catchAsync(async (req, res) => {
  const enrollment = await EnrollmentService.dropCourse(req.validated.params.enrollmentId,req.user.id);
  return ResponseHandler.success(res,"Course dropped successfully",enrollment);
});

module.exports = {
  EnrollInCourse,
  GetMyEnrollments,
  GetMyEnrollmentById,
  CompleteLesson,
  DropCourse,
};
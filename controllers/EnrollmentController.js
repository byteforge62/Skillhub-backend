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

const ToggleSaved = catchAsync(async (req, res) => {
  const enrollment = await EnrollmentService.toggleSavedEnrollment(
    req.validated.params.enrollmentId,
    req.user.id,
  );
  return ResponseHandler.success(
    res,
    enrollment.saved ? "Track saved" : "Track removed from saved",
    enrollment,
  );
});

const GetLessonNote = catchAsync(async (req, res) => {
  const { enrollmentId, lessonId } = req.validated.params;
  const note = await EnrollmentService.getLessonNote(
    enrollmentId,
    lessonId,
    req.user.id,
  );
  return ResponseHandler.success(res, "Lesson note fetched successfully", note);
});

const SaveLessonNote = catchAsync(async (req, res) => {
  const { enrollmentId, lessonId } = req.validated.params;
  const note = await EnrollmentService.saveLessonNote(
    enrollmentId,
    lessonId,
    req.user.id,
    req.validated.body.content,
  );
  return ResponseHandler.success(res, "Lesson note saved", note);
});

module.exports = {
  EnrollInCourse,
  GetMyEnrollments,
  GetMyEnrollmentById,
  CompleteLesson,
  DropCourse,
  ToggleSaved,
  GetLessonNote,
  SaveLessonNote,
};
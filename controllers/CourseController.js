const CourseService = require("../services/CourseService");

const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const CreateCourse = catchAsync(async (req, res) => {
  const course = await CourseService.createCourse(req.user.id,req.validated.body);
  return ResponseHandler.success(res,"Course created successfully",course,201);
});

const GetCourses = catchAsync(async (req, res) => {
  const courses = await CourseService.getCourses(req.validated.query);
  return ResponseHandler.success(res,"Courses fetched successfully",courses);
});

const GetMyCourses = catchAsync(async (req, res) => {
  const courses = await CourseService.getMyCourses(req.user.id);
  return ResponseHandler.success(res, "Your courses fetched successfully", courses);
});

const CourseById = catchAsync(async (req, res) => {
  const course = await CourseService.getCourseById(req.params.id,);
  return ResponseHandler.success(res, "Course fetched successfully", course,);
});

const UpdateCourse = catchAsync(async (req, res) => {
  const updatedCourse = await CourseService.updateCourse(req.params.id, req.user.id, req.validated.body,);
  return ResponseHandler.success(res, "Course updated successfully", updatedCourse,);
});

const PublishCourse = catchAsync(async (req, res) => {
  const course = await CourseService.publishCourse(req.params.id, req.user.id,);
  return ResponseHandler.success(res, "Course published successfully", course,);
});

const ArchiveCourse = catchAsync(async (req, res) => {
  const course = await CourseService.archiveCourse(req.params.id, req.user.id,);
  return ResponseHandler.success(res, "Course archived successfully", course,);
});

const DeleteCourse = catchAsync(async (req, res) => {
  await CourseService.deleteCourse(req.params.id, req.user.id,);
  return ResponseHandler.success(res, "Course deleted successfully", null,);
});

const UploadCourseThumbnail = catchAsync(async (req, res) => {
  const course = await CourseService.uploadCourseThumbnail(req.params.id, req.user.id, req.file,);
  return ResponseHandler.success(res, "Thumbnail uploaded successfully", course,);
});

module.exports = {
  CreateCourse,
  GetCourses,
  GetMyCourses,
  CourseById,
  UpdateCourse,
  PublishCourse,
  ArchiveCourse,
  DeleteCourse,
  UploadCourseThumbnail,
};
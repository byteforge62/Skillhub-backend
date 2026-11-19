const LessonService = require("../services/LessonService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const CreateLesson = catchAsync(async (req, res) => {
  const lesson = await LessonService.createLesson(req.params.sectionId,req.user.id,req.validated.body,);
  return ResponseHandler.success(res,"Lesson created successfully",lesson,201,);
});

const GetSectionLessons = catchAsync(async (req, res) => {
  const lessons = await LessonService.getSectionLessons(req.params.sectionId,);
  return ResponseHandler.success(res,"Section lessons fetched successfully",lessons,);
});

const GetLessonById = catchAsync(async (req, res) => {
  const lesson = await LessonService.getLessonById(req.params.lessonId,);
  return ResponseHandler.success(res,"Lesson fetched successfully",lesson,);
});

const UpdateLesson = catchAsync(async (req, res) => {
  const lesson = await LessonService.updateLesson(req.params.lessonId,req.user.id,req.validated.body,);
  return ResponseHandler.success(res,"Lesson updated successfully",lesson,);
});

const PublishLesson = catchAsync(async (req, res) => {
  const lesson = await LessonService.publishLesson(req.params.lessonId,req.user.id,);
  return ResponseHandler.success(res,"Lesson published successfully",lesson,);
});

const DeleteLesson = catchAsync(async (req, res) => {
  await LessonService.deleteLesson(req.params.lessonId,req.user.id,);
  return ResponseHandler.success(res,"Lesson deleted successfully",null,);
});

module.exports = {
  CreateLesson,
  GetSectionLessons,
  GetLessonById,
  UpdateLesson,
  PublishLesson,
  DeleteLesson,
};
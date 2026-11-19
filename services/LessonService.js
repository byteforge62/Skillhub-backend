const LessonModel = require("../models/LessonModel");
const CourseSectionModel = require("../models/CourseSectionModel");
const CourseModel = require("../models/CoursesModel");
const ResourceModel = require("../models/ResourcesModel");

const AppError = require("../utils/AppError");

const verifyResourceReferences = async(blocks = []) => {
  const resourceIds = blocks
  .filter((block) => block.type === "resource")
  .map((block) => block.data.resourceId);

  if(resourceIds.length === 0){
    return;
  }

  const resources = await ResourceModel.find({
    _id: { $in: resourceIds}
  }).select("_id");

  const existingIds = new Set(
    resources.map((resource) => resource._id.toString())
  )

  const missingResourceId = resourceIds.find(
    (resourceId) => !existingIds.has(resourceId.toString())
  );

  if(missingResourceId){
    throw new AppError(
      `Resource not found: ${missingResourceId}`,
    )
  }
}

const verifySectionOwnership = async (sectionId, userId) => {
  const section = await CourseSectionModel.findById(sectionId).select("course",);
  if (!section) {
    throw new AppError("Course section not found", 404);
  }

  const course = await CourseModel.findById(section.course).select("createdBy",);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy.toString() !== userId.toString()) {
    throw new AppError(
      "You are not authorized to manage this course",
      403,
    );
  }

  return section;
};

const createLesson = async (sectionId, userId, lessonData) => {
  await verifySectionOwnership(sectionId, userId);

  await verifyResourceReferences(lessonData.blocks);

  const existingLesson = await LessonModel.findOne({section: sectionId,order: lessonData.order,});
  if (existingLesson) {
    throw new AppError(
      "A lesson with this order already exists in this section",
      409,
    );
  }

  return await LessonModel.create({
    ...lessonData,
    section: sectionId,
  });
};

const getSectionLessons = async (sectionId) => {
  const section = await CourseSectionModel.findById(sectionId).select("_id");
  if (!section) {
    throw new AppError("Course section not found", 404);
  }

  return await LessonModel.find({
    section: sectionId,
    status: "published",
  }).sort({order: 1,createdAt: 1,});
};

const getLessonById = async (lessonId) => {
  const lesson = await LessonModel.findOne({
    _id: lessonId,
    status: "published",
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }
  return lesson;
};

const updateLesson = async (lessonId, userId, updateData) => {
  const lesson = await LessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await verifySectionOwnership(lesson.section, userId);

  if(updateData.blocks !== undefined){
    await verifyResourceReferences(updateData.blocks);
  }

  if (updateData.order !== undefined) {
    const existingLesson = await LessonModel.findOne({
      section: lesson.section,
      order: updateData.order,
      _id: { $ne: lessonId },
    });

    if (existingLesson) {
      throw new AppError("A lesson with this order already exists in this section",409,);
    }
  }

  return await LessonModel.findByIdAndUpdate(
    lessonId,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );
};

const publishLesson = async (lessonId, userId) => {
  const lesson = await LessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await verifySectionOwnership(lesson.section, userId);

  if (lesson.status === "published") {
    throw new AppError("Lesson is already published", 400);
  }

  lesson.status = "published";

  await lesson.save();
  return lesson;
};

const deleteLesson = async (lessonId, userId) => {
  const lesson = await LessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await verifySectionOwnership(lesson.section, userId);

  await LessonModel.findByIdAndDelete(lessonId);
};

module.exports = {
  createLesson,
  getSectionLessons,
  getLessonById,
  updateLesson,
  publishLesson,
  deleteLesson,
};
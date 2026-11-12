const EnrollmentModel = require("../models/EnrollmentModel");
const CourseModel = require("../models/CoursesModel");
const LessonModel = require("../models/LessonModel");
const CourseSectionModel = require("../models/CourseSectionModel");
const AppError = require("../utils/AppError");

const verifyCourseForEnrollment = async (courseId) => {
  const course = await CourseModel.findById(courseId).select("_id title status");
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== "published") {
    throw new AppError("You can only enroll in published courses",400);
  }
  return course;
};

const enrollInCourse = async (userId, courseId) => {
  await verifyCourseForEnrollment(courseId);

  const existingEnrollment = await EnrollmentModel.findOne({userId,courseId});
  if (existingEnrollment) {
    if (existingEnrollment.status === "active") {
      throw new AppError("You are already enrolled in this course",409);
    }

    if (existingEnrollment.status === "completed") {
      throw new AppError("You have already completed this course",409);
    }

    if (existingEnrollment.status === "dropped" || existingEnrollment.status === "cancelled") {
      existingEnrollment.status = "active";
      existingEnrollment.progress = 0;
      existingEnrollment.completedLessons = [];
      existingEnrollment.completedAt = null;
      existingEnrollment.enrolledAt = new Date();

      return await existingEnrollment.save();
    }
  }

  return await EnrollmentModel.create({
    userId,
    courseId,
    status: "active",
    progress: 0,
    completedLessons: [],
  });
};

const getMyEnrollments = async (userId) => {
  return await EnrollmentModel.find({ userId })
    .populate({
      path: "courseId",
      select:
        "title description imageUrl price duration level language category",
      populate: {
        path: "category",
        select: "name",
      },
    })
    .sort({ updatedAt: -1 });
};

const getMyEnrollmentById = async (enrollmentId, userId) => {
  const enrollment = await EnrollmentModel.findOne({_id: enrollmentId,userId}).populate({
    path: "courseId",
    select:
      "title description imageUrl price duration level language category",
    populate: {
      path: "category",
      select: "name",
    },
  });

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  return enrollment;
};

const completeLesson = async (enrollmentId,lessonId,userId) => {
  const enrollment = await EnrollmentModel.findOne({
    _id: enrollmentId,
    userId,
  });
  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  const lesson = await LessonModel.findById(lessonId).select("_id section status");
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const courseSections = await CourseSectionModel.find({
    course: enrollment.courseId,
  }).select("_id");
  const sectionIds = courseSections.map((section) => section._id.toString());

  if (!sectionIds.includes(lesson.section.toString())) {
    throw new AppError("Lesson not found in this course", 404);
  }

  if (enrollment.status !== "active") {
    if (
      enrollment.status === "completed" &&
      enrollment.completedLessons.some(
        (completedLessonId) =>
          completedLessonId.toString() === lessonId.toString(),
      )
    ) {
      return enrollment;
    }

    throw new AppError("This enrollment is no longer active", 400);
  }

  if (lesson.status !== "published") {
    throw new AppError("You cannot complete an unpublished lesson",400);
  }

  const alreadyCompleted = enrollment.completedLessons.some(
    (completedLessonId) =>
      completedLessonId.toString() === lessonId.toString(),
  );
  if (!alreadyCompleted) {
    if (typeof enrollment.completedLessons.addToSet === "function") {
      enrollment.completedLessons.addToSet(lessonId);
    } else {
      enrollment.completedLessons.push(lessonId);
    }
  }

  const publishedLessons = await LessonModel.find({
    section: { $in: sectionIds },
    status: "published",
  }).select("_id");
  const publishedLessonIds = new Set(
    publishedLessons.map((publishedLesson) =>
      publishedLesson._id.toString(),
    ),
  );
  const completedLessonIds = new Set(
    enrollment.completedLessons
      .map((completedLessonId) => completedLessonId.toString())
      .filter((completedLessonId) => publishedLessonIds.has(completedLessonId)),
  );
  const totalLessons = publishedLessonIds.size;

  if (totalLessons === 0) {
    enrollment.progress = 0;
  } else {
    enrollment.progress = Math.round(
      (completedLessonIds.size / totalLessons) * 100,
    );
  }

  if (totalLessons > 0 && completedLessonIds.size === totalLessons) {
    enrollment.progress = 100;
    enrollment.status = "completed";
    enrollment.completedAt ||= new Date();
  }

  await enrollment.save();
  return enrollment;
};

const dropCourse = async (enrollmentId, userId) => {
  const enrollment = await EnrollmentModel.findOne({
    _id: enrollmentId,
    userId,
  });
  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  if (enrollment.status !== "active") {
    throw new AppError("Only active enrollments can be dropped",400);
  }

  enrollment.status = "dropped";
  await enrollment.save();
  return enrollment;
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getMyEnrollmentById,
  completeLesson,
  dropCourse,
};
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CourseModel = require("../models/CoursesModel");
const CourseSectionModel = require("../models/CourseSectionModel");
const LessonModel = require("../models/LessonModel");
const EnrollmentModel = require("../models/EnrollmentModel");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = require("../config/s3");
const AppError = require("../utils/AppError");

const uploadsRoot = path.join(__dirname, "..", "uploads");
const thumbnailExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

/**
 * Stores the thumbnail on local disk under /uploads. Used when S3 is not
 * configured (or the upload fails) so course creation works out of the box.
 */
const storeThumbnailLocally = async (file) => {
  const directory = path.join(uploadsRoot, "course-thumbnails");
  await fs.promises.mkdir(directory, { recursive: true });

  const extension = thumbnailExtensions[file.mimetype] || ".jpg";
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;

  await fs.promises.writeFile(path.join(directory, fileName), file.buffer);

  return `/uploads/course-thumbnails/${fileName}`;
};

const s3IsConfigured = () =>
  Boolean(
    process.env.AWS_BUCKET_NAME &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION,
  );

const createCourse = async (userId, courseData) => {
  const course = await CourseModel.create({
    ...courseData,
    createdBy: userId,
    status: "draft",
  });

  return course;
};

const uploadCourseThumbnail = async (courseId, userId, file) => {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to update this course", 403);
  }

  let imageUrl = null;

  if (s3IsConfigured() && process.env.UPLOAD_DRIVER !== "local") {
    try {
      const fileName = `course-thumbnails/${Date.now()}-${crypto
        .randomBytes(6)
        .toString("hex")}${thumbnailExtensions[file.mimetype] || ".jpg"}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      imageUrl =
        `https://${process.env.AWS_BUCKET_NAME}.s3.` +
        `${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      imageUrl = null;
    }
  }

  if (!imageUrl) {
    imageUrl = await storeThumbnailLocally(file);
  }

  course.imageUrl = imageUrl;
  await course.save();

  return course;
};

/**
 * Attaches catalogue metadata (sections, published lessons, learners) so list
 * and detail views can render real counts instead of inventing them.
 */
const withCourseStats = async (courses) => {
  const list = courses.map((course) =>
    course?.toObject ? course.toObject() : course,
  );
  const ids = list.map((course) => course?._id).filter(Boolean);

  if (ids.length === 0) return list;

  const sections = await CourseSectionModel.find({ course: { $in: ids } })
    .select("_id course")
    .lean();
  const sectionIds = sections.map((section) => section._id);

  const lessons = sectionIds.length
    ? await LessonModel.find({
        section: { $in: sectionIds },
        status: "published",
      })
        .select("_id section")
        .lean()
    : [];

  const sectionCourse = new Map(
    sections.map((section) => [String(section._id), String(section.course)]),
  );

  const sectionCountByCourse = new Map();
  sections.forEach((section) => {
    const key = String(section.course);
    sectionCountByCourse.set(key, (sectionCountByCourse.get(key) || 0) + 1);
  });

  const lessonCountByCourse = new Map();
  lessons.forEach((lesson) => {
    const key = sectionCourse.get(String(lesson.section));
    if (!key) return;
    lessonCountByCourse.set(key, (lessonCountByCourse.get(key) || 0) + 1);
  });

  const enrollmentCounts = await EnrollmentModel.aggregate([
    { $match: { courseId: { $in: ids } } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);
  const learnerCountByCourse = new Map(
    enrollmentCounts.map((row) => [String(row._id), row.count]),
  );

  return list.map((course) => ({
    ...course,
    sectionCount: sectionCountByCourse.get(String(course._id)) || 0,
    lessonCount: lessonCountByCourse.get(String(course._id)) || 0,
    enrollmentCount: learnerCountByCourse.get(String(course._id)) || 0,
  }));
};

const courseListQuery = (filter, sortOption, skip, limit) =>
  CourseModel.find(filter)
    .populate("createdBy", "fullname email avatar")
    .populate("category", "name")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

const getCourses = async ({page=1,limit=10,search,category,level,language,sort="newest"}={}) => {
  const skip = (page - 1) * limit;

  const filter = {
    status:"published"
  };

  let sortOption = { createdAt: -1};

  if(sort === "oldest"){
    sortOption = {createdAt: 1}
  }

  if(sort === "price_low"){
    sortOption = {price: 1};
  }

  if(sort === "price_high"){
    sortOption = {price: -1};
  }

  
  if(search){
   filter.$or = [
     { title: {$regex: search,$options: "i"}},
     { description: {$regex: search,$options: "i"}},
     { overview: {$regex: search,$options: "i"}},
     { tags: {$regex: search,$options: "i"}}
    ]
  }

  if(category){
    filter.category = category;
  }

  if(level){
    filter.level = level;
  }

  if(language){
    filter.language = language;
  }

  const [courses,total] = await Promise.all([
    courseListQuery(filter, sortOption, skip, limit),
    CourseModel.countDocuments(filter)
  ]);


  const totalPages = Math.ceil(total/limit);
  return {
    courses: await withCourseStats(courses),
    pagination:{
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && total > 0,
    }
  }
};

/**
 * Public preview of the catalogue for the landing page. Deliberately does not
 * require a session and only exposes published courses.
 */
const getFeaturedCourses = async (limit = 3) => {
  const courses = await CourseModel.find({ status: "published" })
    .populate("createdBy", "fullname avatar role")
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 3, 1), 12));

  return withCourseStats(courses);
};

const getCourseById = async (courseId) => {
  const course = await CourseModel.findById({
    _id: courseId,
    status: "published",
  })
    .populate("createdBy", "fullname email avatar")
    .populate("category", "name");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const [shaped] = await withCourseStats([course]);
  return shaped;
};

const getMyCourses = async (userId) => {
  const courses = await CourseModel.find({
    createdBy: userId,
  })
    .populate("createdBy", "fullname email avatar")
    .populate("category", "name")
    .sort({ updatedAt: -1 });

  return withCourseStats(courses);
};

/**
 * Creator view of a single course. Unlike the public detail endpoint this
 * returns drafts and archived courses, but only to their owner.
 */
const getCourseForOwner = async (courseId, userId) => {
  const course = await CourseModel.findById(courseId)
    .populate("createdBy", "fullname email avatar")
    .populate("category", "name");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const ownerId = String(course.createdBy?._id ?? course.createdBy);
  if (ownerId !== String(userId)) {
    throw new AppError("You are not authorized to manage this course", 403);
  }

  const [shaped] = await withCourseStats([course]);
  return shaped;
};

const updateCourse = async (courseId, userId, updateData) => {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to update this course", 403);
  }

  const updatedCourse = await CourseModel.findByIdAndUpdate(
    courseId,
    updateData,
    { new: true, runValidators: true },
  )
    .populate("createdBy", "fullname email")
    .populate("category", "name");
  return updatedCourse;
};

const publishCourse = async (courseId, userId) => {
  const course = await CourseModel.findById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to publish this course", 403);
  }

  if (course.status === "published") {
    throw new AppError("Course is already published", 400);
  }

  if (course.status === "archived") {
    throw new AppError("Archived course cannot be published", 400);
  }

  course.status = "published";
  if (!course.publishedAt) {
    course.publishedAt = new Date();
  }

  await course.save();

  return course;
};

const archiveCourse = async (courseId, userId) => {
  const course = await CourseModel.findById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy.toString() !== userId.toString()) {
    throw new AppError(
      "You are not authorized to archive this course",
      403,
    );
  }

  if (course.status === "archived") {
    throw new AppError(
      "Course is already archived",
      400,
    );
  }

  course.status = "archived";

  await course.save();

  return course;
};

const deleteCourse = async (courseId, userId) => {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to delete this course", 403);
  }

  await CourseModel.findByIdAndDelete(courseId);
};

module.exports = {
  createCourse,
  uploadCourseThumbnail,
  getCourses,
  getFeaturedCourses,
  getCourseById,
  getCourseForOwner,
  getMyCourses,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse,
};

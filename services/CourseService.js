const CourseModel = require("../models/CoursesModel");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = require("../config/s3");
const AppError = require("../utils/AppError");

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

  const fileName = `course-thumbnails/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const imageUrl =
    `https://${process.env.AWS_BUCKET_NAME}.s3.` +
    `${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  course.imageUrl = imageUrl;
  await course.save();

  return course;
};

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
    CourseModel.find(filter)
    .populate("createdBy","fullname email")
    .populate("category","name")
    .sort(sortOption)
    .skip(skip)
    .limit(limit),
    CourseModel.countDocuments(filter)
  ]);


  const totalPages = Math.ceil(total/limit);
  return {
    courses,
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

const getCourseById = async (courseId) => {
  const course = await CourseModel.findById({
    _id: courseId,
    status: "published",
  })
    .populate("createdBy", "fullname email")
    .populate("category", "name");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

const getMyCourses = async (userId) => {
  return await CourseModel.find({
    createdBy: userId,
  })
    .populate("category", "name")
    .sort({ updatedAt: -1 });
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
  getCourseById,
  getMyCourses,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse,
};

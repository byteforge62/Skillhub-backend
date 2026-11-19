const route = require("express").Router();

const CourseController = require("../controllers/CourseController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const {createCourseSchema,updateCourseSchema,courseQuerySchema} = require("../validations/course.validation");

route.post("/courses",authMiddleware.verifyToken,validate(createCourseSchema),CourseController.CreateCourse,);
route.get("/courses",authMiddleware.verifyToken,validate(courseQuerySchema),CourseController.GetCourses,);
route.get("/courses/me",authMiddleware.verifyToken,CourseController.GetMyCourses,);
route.get("/courses/:id",authMiddleware.verifyToken,CourseController.CourseById,);
route.patch("/courses/:id",authMiddleware.verifyToken,validate(updateCourseSchema),CourseController.UpdateCourse,);
route.patch("/courses/:id/publish",authMiddleware.verifyToken,CourseController.PublishCourse,);
route.patch("/courses/:id/archive",authMiddleware.verifyToken,CourseController.ArchiveCourse,);
route.delete("/courses/:id",authMiddleware.verifyToken,CourseController.DeleteCourse,);
route.post("/courses/:id/thumbnail",authMiddleware.verifyToken,upload.single("thumbnail"),CourseController.UploadCourseThumbnail,);

module.exports = route;
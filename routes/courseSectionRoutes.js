const route = require("express").Router();

const CourseSectionController = require("../controllers/CourseSectionController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {createCourseSectionSchema,updateCourseSectionSchema,} = require("../validations/courseSection.validation");

route.post("/courses/:courseId/sections",authMiddleware.verifyToken,validate(createCourseSectionSchema),CourseSectionController.CreateSection,);
route.get("/courses/:courseId/sections",authMiddleware.verifyToken,CourseSectionController.GetCourseSections,);
route.patch("/sections/:sectionId",authMiddleware.verifyToken,validate(updateCourseSectionSchema),CourseSectionController.UpdateSection,);
route.delete("/sections/:sectionId",authMiddleware.verifyToken,CourseSectionController.DeleteSection,);

module.exports = route;
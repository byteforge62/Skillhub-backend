const CourseSectionService = require("../services/CourseSectionService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");


const CreateSection = catchAsync(async (req,res) => {
    const section = await CourseSectionService.createSection(req.params.courseId,req.user.id,req.validated.body);
    return ResponseHandler.success(res,"Course section created successfully",section,201);
})

const GetCourseSections = catchAsync(async (req,res) => {
    const sections = await CourseSectionService.getCourseSections(req.params.courseId);
    return ResponseHandler.success(res,"Course Sections fetched successfully",sections,200);
})

const UpdateSection = catchAsync(async (req,res) => {
    const section = await CourseSectionService.updateSection(req.params.sectionId,req.user.id,req.validated.body);
    return ResponseHandler.success(res,"Course section updated successfully",section);
})

const DeleteSection = catchAsync(async (req,res) => {
    await CourseSectionService.deleteSection(req.params.sectionId,req.user.id);
    return ResponseHandler.success(res,"Course section deleted successfully",null);
})

module.exports = {
    CreateSection,
    GetCourseSections,
    UpdateSection,
    DeleteSection
}
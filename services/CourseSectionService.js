const CourseSectionModel = require("../models/CourseSectionModel");
const CourseModel = require("../models/CoursesModel");
const AppError = require("../utils/AppError");

const verifyCourseOwnership = async (courseId,userId) => {
    const course = await CourseModel.findById(courseId).select("createdBy");
    if(!course){
        throw new AppError("Course not found",404);
    }

    if(course.createdBy.toString() !== userId.toString()){
        throw new AppError("You are not authorized to manage this course",403);
    }

    return course;
}

const createSection = async(courseId,userId,sectionData) => {
    const {title,description,order} = sectionData;

    await verifyCourseOwnership(courseId,userId);

    const existingSection = await CourseSectionModel.findOne({course: courseId,order});
    if(existingSection){
        throw new AppError("A section with this order already exists in this course",409);
    }

    return await CourseSectionModel.create({
        course: courseId,
        title,
        description,
        order,
    })
}

const getCourseSections = async(courseId) => {
    const course = await CourseModel.findById(courseId).select("_id");
    if(!course){
        throw new AppError("Course not found",404);
    }

    return await CourseSectionModel.find({course: courseId}).sort({order:1,createdAt:1});
}

const updateSection = async(sectionId,userId,updateData) => {
    const section = await CourseSectionModel.findById(sectionId);
    if(!section){
        throw new AppError("Section not found",404);
    }

    await verifyCourseOwnership(section.course,userId);

    if(updateData.order !== undefined){
        const existingSection = await CourseSectionModel.findOne({
            course: section.course,
            order: updateData.order,
            _id:{$ne:sectionId},
        });

        if(existingSection){
            throw new AppError("A section with this order already exists in this course",409);
        }

        return await CourseSectionModel.findByIdAndUpdate(
            sectionId,
            updateData,
            {
                new:true,
                runValidators: true,
            }
        )
    }
}

const deleteSection = async(sectionId,userId) => {
    const section = await CourseSectionModel.findById(sectionId);
    if(!section){
        throw new AppError("Section not found",404);
    }

    await verifyCourseOwnership(section.course,userId);

    await CourseSectionModel.findByIdAndDelete(sectionId);
}

module.exports = {
    createSection,
    getCourseSections,
    updateSection,
    deleteSection
}
const mongoose = require("mongoose");

const {Schema} = mongoose;

const CourseSectionSchema = new Schema(
    {
        course:{
            type:Schema.Types.ObjectId,
            ref:"Course",
            required:true,
            index:true
        },
        title:{
            type:String,
            required:[true,"Section title is required"],
            trim:true,
            minLength:2,
            maxLength:150
        },
        description:{
            type:String,
            trim:true,
            maxLength:500,
            default:""
        },
        order:{
            type:Number,
            required:true,
            min:1
        }
    },
    {
        timestamps:true
    }
);

CourseSectionSchema.index(
    {course:1,order:1},
    {unique:true}
)

module.exports = mongoose.model("CourseSection",CourseSectionSchema);
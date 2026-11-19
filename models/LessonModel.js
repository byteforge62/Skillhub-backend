const mongoose = require("mongoose");
const {Schema} = mongoose;

const LessonBlockSchema = new Schema({
    type:{
        type:String,
        enum:[
            "text",
            "code",
            "image",
            "video",
            "callout",
            "resource",
            "quiz",
            "tool"

        ],
        required: true,
    },

    order:{
        type:Number,
        required:true,
        min:1,
    },

    data:{
        type: Schema.Types.Mixed,
        required: true
    }
},{
    _id: true,
});

const LessonSchema = new Schema({
    section:{
        type:Schema.Types.ObjectId,
        ref:"CourseSection",
        required:true,
        index:true,
    },

    title:{
        type:String,
        required:[true,"Lesson title is required"],
        trim:true,
        minLength:2,
        maxLength:200,
    },

    description:{
        type:String,
        trim:true,
        maxlength: 1000,
        default: "",
    },

    blocks:{
        type: [LessonBlockSchema],
        default:[]
    },

    duration:{
        type:Number,
        min:0,
        default:0
    },

    order:{
        type:Number,
        required:true,
        min:1
    },
    isPreview:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["draft","published"],
        default:"draft"
    }
},{
    timestamps:true,
})

LessonSchema.index(
    { section:1,order:1},
    { unique:true }
)

module.exports = mongoose.model("Lesson",LessonSchema);
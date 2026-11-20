const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const EventSchema = Schema({
    title:{
        type:String,
        required:[true, "Event title is required"]
    },
    description:{
        type:String,
        required:[true, "Event description is required"],
    },
        date:{
            type:Date,
            required:[true, "Event date is required"]
        },
        /** Session length in minutes. Older records fall back to 60 in the API. */
        duration:{
            type:Number,
            min:[0, "Event duration cannot be negative"],
            default:60
        },
        /** Optional seat cap so the UI can show "N seats left". */
        capacity:{
            type:Number,
            min:[1, "Event capacity must be at least 1"],
            default:null
        },
        location:{
            type:String,
            required:[true, "Event location is required"]
        },
        hostId:{
                type:Schema.Types.ObjectId,
                ref:"User"
            },
        status:{
            type:String,
            enum:["draft","published","cancelled"],
            default:"draft"
        },
        banner:{
            type:String,
            required:[true, "Event banner is required"]
        },
        registeredUsers:[{
            type:Schema.Types.ObjectId,
            ref:"User"
        }]
},{
    timestamps:true
})

EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ hostId: 1, date: 1 });

module.exports = mongoose.model("Event",EventSchema)

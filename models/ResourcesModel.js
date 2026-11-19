const mongoose = require("mongoose");
const {Schema} = mongoose;

const ResourceSchema = new Schema(
  {
    title:{
      type:String,
      required:[true,"Resource title is required"],
      trim:true,
      minLength:2,
      maxLength:200,
    },

    description:{
      type:String,
      trim:true,
      maxLength:1000,
      default:""
    },

    type:{
      type:String,
      enum:["link","document","video","repository"],
      required:[true,"Resource type is required"]
    },

    url:{
      type:String,
      required:[true,"Resource URL is required"],
      trim:true
    },

    thumbnail:{
      type:String,
      trim:true,
      default:null
    },

    category:{
      type:Schema.Types.ObjectId,
      ref:"Category",
      default:null,
      index:true
    },

    tags:{
      type:[String],
      default:[]
    },

    createdBy:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required:true,
      index:true,
    }
  },
  {
    timestamps:true,
  }
);

ResourceSchema.index({createdBy:1,createdAt:-1});
ResourceSchema.index({type:1,createdAt:-1});

module.exports = mongoose.model("Resource",ResourceSchema);
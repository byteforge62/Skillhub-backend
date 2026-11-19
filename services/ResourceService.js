const ResourceModel = require("../models/ResourcesModel");
const CategoryModel = require("../models/CategoriesModel") 

const AppError = require("../utils/AppError");

const verifyCategoryReference = async (categoryId) => {
  if (!categoryId) {
    return;
  }

  const category = await CategoryModel.findById(categoryId).select("_id");
  if (!category) {
    throw new AppError(`Category not found: ${categoryId}`, 404);
  }
};

const createResource = async (userId,resourceData) => {
  await verifyCategoryReference(resourceData.category);
  
  const resource = await ResourceModel.create({
    ...resourceData,
    createdBy:userId
  });
  return resource;
}

const getResources = async({page=1,limit=10,search,type,category,sort="newest"} = {}) => {
  const skip = (page-1) * limit;
  const filter = {};

  if(search){
    filter.$or = [
      {title: {$regex:search,$options:"i"}},
      {description:{$regex:search,$options:"i"}},
      {tags:{$regex:search,$options:"i"}}
    ]
  }

  if(type){
    filter.type= type;
  }

  if(category){
    filter.category = category;
  }

  let sortOption = {createdAt: -1};

  if(sort === "oldest"){
    sortOption = {createdAt:1};
  }

  const [resources,total] = await Promise.all([
    ResourceModel.find(filter)
    .populate("createdBy","fullname email")
    .populate("category","name")
    .sort(sortOption)
    .skip(skip)
    .limit(limit),

    ResourceModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total/limit);

  return {
    resources,
    pagination:{
      page,
      limit,
      total,
      totalPages,
      hasNextPage:page < totalPages,
      hasPreviousPage: page > 1 && total > 0,
    }
  }
}

const getResourceById = async (resourceId) => {
  const resource = await ResourceModel.findById(resourceId)
  .populate("createdBy","fullname email")
  .populate("category","name");

  if(!resource){
    throw new AppError("Resource not found",404)
  }

  return resource;
}

const updateResource = async(resourceId,userId,updateData) => {
  const resource = await ResourceModel.findById(resourceId);
  if(!resource){
    throw new AppError("Resource not found",404);
  }

  if(resource.createdBy.toString() !== userId.toString()){
    throw new AppError("You are not authorized to manage this resource",403);
  }

  if(updateData.category !== undefined){
    await verifyCategoryReference(updateData.category);
  }

  return await ResourceModel.findByIdAndUpdate(
    resourceId,
    updateData,
    {
      new:true,
      runValidators:true
    }
  )
  .populate("createdBy","fullname email")
  .populate("category","name");
}

const deleteResource = async (resourceId,userId) => {
  const resource = await ResourceModel.findById(resourceId);
  if(!resource){
    throw new AppError("Resource not found",404);
  }

  if(resource.createdBy.toString() !== userId.toString()){
    throw new AppError("You are not authorized to delete this resource",403)
  }

  await ResourceModel.findByIdAndDelete(resourceId);
}

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource
}
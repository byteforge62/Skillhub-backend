const ResourceService = require("../services/ResourceService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const CreateResource = catchAsync(async (req, res) => {
  const resource = await ResourceService.createResource(req.user.id,req.validated.body);
  return ResponseHandler.success(res,"Resource created successfully",resource,201);
});

const GetResources = catchAsync(async (req, res) => {
  const resources = await ResourceService.getResources(req.validated.query);
  return ResponseHandler.success(res,"Resources fetched successfully",resources);
});

const GetResourceById = catchAsync(async (req, res) => {
  const resource = await ResourceService.getResourceById(req.params.resourceId);
  return ResponseHandler.success(res,"Resource fetched successfully",resource);
});

const UpdateResource = catchAsync(async (req, res) => {
  const resource = await ResourceService.updateResource(req.params.resourceId,req.user.id,req.validated.body);
  return ResponseHandler.success(res,"Resource updated successfully",resource);
});

const DeleteResource = catchAsync(async (req, res) => {
  await ResourceService.deleteResource(req.params.resourceId,req.user.id);
  return ResponseHandler.success(res,"Resource deleted successfully",null);
});

module.exports = {
  CreateResource,
  GetResources,
  GetResourceById,
  UpdateResource,
  DeleteResource,
};
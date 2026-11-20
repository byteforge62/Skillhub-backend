const CategoryService = require("../services/CategoryService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddCategory = catchAsync(async (req, res) => {
    const addedCategory = await CategoryService.addCategory(req.body);
    return ResponseHandler.success(res,"Category Added Successfully",addedCategory,201);
});

const GetCategories = catchAsync(async (req, res) => {
    const categories = await CategoryService.listCategories();
    return ResponseHandler.success(res, "Categories fetched successfully", categories);
});

module.exports = {
    AddCategory,
    GetCategories,
};
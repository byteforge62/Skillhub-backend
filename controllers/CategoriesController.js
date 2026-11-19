const CategoryService = require("../services/CategoryService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddCategory = catchAsync(async (req, res) => {
    const addedCategory = await CategoryService.addCategory(req.body);
    return ResponseHandler.success(res,"Category Added Successfully",addedCategory,201);
});

module.exports = {
    AddCategory,
};
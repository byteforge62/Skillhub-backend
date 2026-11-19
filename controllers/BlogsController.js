const BlogService = require("../services/BlogService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddBlog = catchAsync(async (req, res) => {
    const addedBlog = await BlogService.addBlog(req.body);
    return ResponseHandler.success(res,"Blog Added Successfully",addedBlog,201);
});

module.exports = {
    AddBlog,
};
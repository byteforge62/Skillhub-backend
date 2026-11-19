const BlogsModel = require("../models/BlogsModel");

const addBlog = async (blogData) => {
    const addedBlog = await BlogsModel.create(blogData);
    return addedBlog;
};

module.exports = {
    addBlog,
};
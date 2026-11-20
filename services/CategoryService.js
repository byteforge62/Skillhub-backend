const CategoriesModel = require("../models/CategoriesModel");

const addCategory = async (categoryData) => {
    const addedCategory = await CategoriesModel.create(categoryData);
    return addedCategory;
};

const listCategories = async () => {
    return await CategoriesModel.find().sort({ name: 1 });
};

module.exports = {
    addCategory,
    listCategories,
};
const CategoriesModel = require("../models/CategoriesModel");

const addCategory = async (categoryData) => {
    const addedCategory = await CategoriesModel.create(categoryData);
    return addedCategory;
};

module.exports = {
    addCategory,
};
const route = require("express").Router()
const CategoriesController = require("../controllers/CategoriesController")
const authMiddleware = require("../middleware/authMiddleware")
route.post("/category",authMiddleware.verifyToken,authMiddleware.isAdmin,CategoriesController.AddCategory)
route.get("/categories",authMiddleware.verifyToken,CategoriesController.GetCategories)
module.exports = route
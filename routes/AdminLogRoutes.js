const route = require("express").Router()
const AdminLogController = require("../controllers/AdminLogController")
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validate");
const { createAdminLogSchema } = require("../validations/adminLog.validation");

route.post(
    "/adminlog",
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate(createAdminLogSchema),
    AdminLogController.AddAdminLog,
)
route.get("/adminlog",authMiddleware.verifyToken,authMiddleware.isAdmin,AdminLogController.GetAdminLogs)
module.exports = route
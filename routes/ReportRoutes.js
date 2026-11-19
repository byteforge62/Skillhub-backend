const route = require("express").Router()
const ReportController = require("../controllers/ReportController")
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validate");
const {
  createReportSchema,
  reportIdParamsSchema,
  reportQuerySchema,
  updateReportStatusSchema,
} = require("../validations/report.validation");

route.post(
  "/report",
  authMiddleware.verifyToken,
  validate(createReportSchema),
  ReportController.AddReport,
)
route.get(
  "/reports",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validate(reportQuerySchema),
  ReportController.GetReports,
);
route.patch(
  "/reports/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validate(updateReportStatusSchema),
  ReportController.UpdateReportStatus,
);
route.get(
  "/reports/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validate(reportIdParamsSchema),
  ReportController.GetReportById,
)
route.delete(
  "/report/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validate(reportIdParamsSchema),
  ReportController.DeleteReport,
)
module.exports = route;
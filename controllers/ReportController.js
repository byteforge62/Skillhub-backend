const ReportService = require("../services/ReportService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddReport = catchAsync(async (req, res) => {
  const report = await ReportService.addReport(
    req.user.id,
    req.validated.body,
  );

  return ResponseHandler.success(
    res,
    "Report submitted successfully",
    report,
    201,
  );
});

const GetReports = catchAsync(async (req, res) => {
  const reports = await ReportService.getReports(req.validated.query);

  return ResponseHandler.success(res, "Reports fetched successfully", reports);
});

const UpdateReportStatus = catchAsync(async (req, res) => {
  const report = await ReportService.updateReportStatus(
    req.validated.params.id,
    req.validated.body.status,
    req.user.id,
  );

  return ResponseHandler.success(
    res,
    "Report status updated successfully",
    report,
  );
});

const GetReportById = catchAsync(async (req, res) => {
  const report = await ReportService.getReportById(req.validated.params.id);

  return ResponseHandler.success(res, "Report fetched successfully", report);
});

const DeleteReport = catchAsync(async (req, res) => {
  await ReportService.deleteReport(req.validated.params.id);

  return ResponseHandler.success(res, "Report deleted successfully");
});

module.exports = {
  AddReport,
  GetReports,
  UpdateReportStatus,
  GetReportById,
  DeleteReport,
};

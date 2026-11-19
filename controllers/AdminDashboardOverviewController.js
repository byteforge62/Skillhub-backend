const AdminDashboardOverviewService = require("../services/AdminDashboardOverviewService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

// --- Admin Overview ---
const Overview = catchAsync(async (req, res) => {
  const data = await AdminDashboardOverviewService.getOverview();
  return ResponseHandler.success(res, "Admin overview fetched successfully", data, 200);
});

module.exports = { Overview };

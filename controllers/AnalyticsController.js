const AnalyticsService = require("../services/AnalyticsService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddAnalytics = catchAsync(async (req, res) => {
    const analytics = await AnalyticsService.addAnalytics(req.body);
    return ResponseHandler.success(res,"Analytics Added Successfully",analytics,201);
});

const GetAnalytics = catchAsync(async (req, res) => {
    const analytics = await AnalyticsService.getAnalytics(req.query);
    return ResponseHandler.success(res,"Analytics fetched successfully",analytics);
});

module.exports = {
    AddAnalytics,
    GetAnalytics,
};
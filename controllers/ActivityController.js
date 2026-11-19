const ActivityService = require("../services/ActivityService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const ActivityByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const activities = await ActivityService.getActivitiesByUserId(userId);
  return ResponseHandler.success(res, "Activities fetched successfully", activities, 200);
});

module.exports = { ActivityByUserId };
const AdminLogService = require("../services/AdminLogService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");

const AddAdminLog = catchAsync(async (req, res) => {
    const addedAdminLog = await AdminLogService.addAdminLog(
        req.user.id,
        req.validated.body,
    );
    return ResponseHandler.success(res,"Admin Log Added Successfully",addedAdminLog,201);
});

const GetAdminLogs = catchAsync(async (req, res) => {
    const logs = await AdminLogService.getAdminLogs();
    return ResponseHandler.success(res,"Admin Logs fetched successfully",logs);
});

module.exports = {
    AddAdminLog,
    GetAdminLogs,
};
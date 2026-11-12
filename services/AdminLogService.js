const AdminLogModel = require("../models/AdminLogModel");

const addAdminLog = async (adminId, logData) => {
    const addedAdminLog = await AdminLogModel.create({
        adminId,
        action: logData.action,
        details: logData.details,
    });
    return addedAdminLog;
};

const getAdminLogs = async () => {
    const logs = await AdminLogModel.find().populate("adminId", "fullname email").sort({ createdAt: -1 }).limit(20);
    return logs;
};

module.exports = {
    addAdminLog,
    getAdminLogs,
};
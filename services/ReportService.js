const ReportModel = require("../models/ReportModel");
const UserModel = require("../models/UserModel");
const CourseModel = require("../models/CoursesModel");
const PostModel = require("../models/PostModel");
const AppError = require("../utils/AppError");

const reportTargets = {
  User: UserModel,
  Course: CourseModel,
  Post: PostModel,
};

const verifyReportTarget = async (targetType, targetId) => {
  const targetExists =
    targetType === "Comment"
      ? await PostModel.exists({ "comments._id": targetId })
      : await reportTargets[targetType]?.exists({ _id: targetId });
  if (!targetExists) {
    throw new AppError("Report target not found", 404);
  }
};

const addReport = async (reporter, reportData) => {
  const { type, description, targetType, targetId } = reportData;
  await verifyReportTarget(targetType, targetId);
  const report = await ReportModel.create({
    reporter,
    type,
    description,
    targetType,
    targetId,
  });

  return report;
};

const populateReportTarget = async (report) => {
  if (report.targetType === "Comment") {
    const post = await PostModel.findOne({
      "comments._id": report.targetId,
    }).select("_id comments");
    const comment = post?.comments.id(report.targetId);
    report.targetId = comment
      ? { _id: comment._id, content: comment.content, postId: post._id }
      : null;
    return report;
  }

  await report.populate({
    path: "targetId",
    select: "title fullname",
  });
  return report;
};

const getReports = async ({ status, type, page, limit }) => {
  const filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  const [totalReports, reports] = await Promise.all([
    ReportModel.countDocuments(filter),
    ReportModel.find(filter)
      .populate("reporter", "fullname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);
  await Promise.all(reports.map(populateReportTarget));

  return {
    totalReports,
    page,
    limit,
    pages: Math.ceil(totalReports / limit),
    reports,
  };
};

const updateReportStatus = async (reportId, status, adminId) => {
  const report = await ReportModel.findByIdAndUpdate(
    reportId,
    {
      $set: {
        status,
        resolvedBy: status === "closed" ? adminId : null,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  return report;
};

const getReportById = async (reportId) => {
  const report = await ReportModel.findById(reportId).populate(
    "reporter",
    "fullname email",
  );

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  await populateReportTarget(report);
  return report;
};

const deleteReport = async (reportId) => {
  const deletedReport = await ReportModel.findByIdAndDelete(reportId);

  if (!deletedReport) {
    throw new AppError("Report not found", 404);
  }

  return deletedReport;
};

module.exports = {
  addReport,
  getReports,
  updateReportStatus,
  getReportById,
  deleteReport,
};

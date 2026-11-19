const User = require("../models/UserModel");
const Enrollment = require("../models/EnrollmentModel");
const Certificate = require("../models/CertificatesModel");
const Post = require("../models/PostModel");
const Community = require("../models/CommunityModel");
const Course = require("../models/CoursesModel");
const Report = require("../models/ReportModel");

const getOverview = async () => {
  // --- Stats ---
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalPublished = await Course.countDocuments({ status: "published" });
  const totalUnpublished = await Course.countDocuments({
    status: { $ne: "published" },
  });
  const totalEnrollments = await Enrollment.countDocuments();
  const totalCertificates = await Certificate.countDocuments();
  const totalPosts = await Post.countDocuments();
  const totalCommunities = await Community.countDocuments();

  // --- Latest 5 Users & Courses ---
  const latestUsers = await User.find()
    .select("fullname email role createdAt")
    .sort({ createdAt: -1 })
    .limit(5);
  const latestCourses = await Course.find()
    .select("title status createdAt createdBy")
    .populate("createdBy", "fullname")
    .sort({ createdAt: -1 })
    .limit(5);

  // --- Enrollment trends (group by month) ---
  const enrollmentTrends = await Enrollment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];
  const formattedTrends = enrollmentTrends.map((item) => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    count: item.count,
  }));

  // --- Reports (latest 5) ---
  const latestReports = await Report.find()
    .populate("reporter", "fullname email")
    .sort({ createdAt: -1 })
    .limit(5);

  // --- Active Users (last 7 days) ---
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeUsers = await User.countDocuments({
    updatedAt: { $gte: sevenDaysAgo },
  });

  // --- Top Courses (by enrollments) ---
  const topCoursesAgg = await Enrollment.aggregate([
    {
      $group: {
        _id: "$courseId",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
  ]);
  const topCourses = topCoursesAgg.map((c) => ({
    title: c.courseDetails.title,
    count: c.count,
    category: c.courseDetails.category,
  }));

  return {
    stats: {
      totalUsers,
      totalCourses,
      totalPublished,
      totalUnpublished,
      totalEnrollments,
      totalCertificates,
      totalPosts,
      totalCommunities,
      totalRevenue: 0,
      revenueTrackingAvailable: false,
      activeUsers,
    },
    latestUsers,
    latestCourses,
    enrollmentTrends: formattedTrends,
    latestReports,
    topCourses,
  };
};

module.exports = { getOverview };
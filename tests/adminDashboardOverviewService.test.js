const User = require("../models/UserModel");
const Enrollment = require("../models/EnrollmentModel");
const Certificate = require("../models/CertificatesModel");
const Post = require("../models/PostModel");
const Community = require("../models/CommunityModel");
const Course = require("../models/CoursesModel");
const Report = require("../models/ReportModel");
const { getOverview } = require("../services/AdminDashboardOverviewService");

jest.mock("../models/UserModel", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
}));
jest.mock("../models/EnrollmentModel", () => ({
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
}));
jest.mock("../models/CertificatesModel", () => ({
  countDocuments: jest.fn(),
}));
jest.mock("../models/PostModel", () => ({
  countDocuments: jest.fn(),
}));
jest.mock("../models/CommunityModel", () => ({
  countDocuments: jest.fn(),
}));
jest.mock("../models/CoursesModel", () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
}));
jest.mock("../models/ReportModel", () => ({
  find: jest.fn(),
}));

const makeQuery = (result) => {
  const query = {
    select: jest.fn(() => query),
    populate: jest.fn(() => query),
    sort: jest.fn(() => query),
    limit: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

describe("AdminDashboardOverviewService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.countDocuments.mockResolvedValue(10);
    Course.countDocuments.mockResolvedValue(4);
    Enrollment.countDocuments.mockResolvedValue(7);
    Certificate.countDocuments.mockResolvedValue(2);
    Post.countDocuments.mockResolvedValue(9);
    Community.countDocuments.mockResolvedValue(3);
    User.find.mockReturnValue(makeQuery([]));
    Course.find.mockReturnValue(makeQuery([]));
    Report.find.mockReturnValue(makeQuery([]));
    Enrollment.aggregate
      .mockResolvedValueOnce([
        { _id: { year: 2026, month: 1 }, count: 4 },
      ])
      .mockResolvedValueOnce([
        {
          _id: "course-1",
          count: 7,
          courseDetails: { title: "Course", category: "category-1" },
        },
      ]);
  });

  it("uses current status and enrollment reference fields for overview metrics", async () => {
    const overview = await getOverview();

    expect(Course.countDocuments).toHaveBeenCalledWith({
      status: "published",
    });
    expect(Course.countDocuments).toHaveBeenCalledWith({
      status: { $ne: "published" },
    });
    expect(Enrollment.aggregate.mock.calls[0][0][0].$group._id).toEqual({
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
    });
    expect(Enrollment.aggregate.mock.calls[1][0][0].$group._id).toBe(
      "$courseId",
    );
    expect(overview.enrollmentTrends).toEqual([
      { month: "Jan 2026", count: 4 },
    ]);
    expect(overview.topCourses).toEqual([
      { title: "Course", count: 7, category: "category-1" },
    ]);
    expect(overview.stats.totalRevenue).toBe(0);
    expect(overview.stats.revenueTrackingAvailable).toBe(false);
  });
});

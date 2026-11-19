const ReportModel = require("../models/ReportModel");
const UserModel = require("../models/UserModel");
const CourseModel = require("../models/CoursesModel");
const PostModel = require("../models/PostModel");
const ReportService = require("../services/ReportService");

jest.mock("../models/ReportModel", () => ({
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock("../models/UserModel", () => ({
  exists: jest.fn(),
}));
jest.mock("../models/CoursesModel", () => ({
  exists: jest.fn(),
}));
jest.mock("../models/PostModel", () => ({
  exists: jest.fn(),
  findOne: jest.fn(),
}));

const makeQuery = (result) => {
  const query = {
    populate: jest.fn(() => query),
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

describe("ReportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("binds a report to its authenticated reporter and verifies its target", async () => {
    const report = { _id: "report-1" };
    UserModel.exists.mockResolvedValue({ _id: "target-user" });
    ReportModel.create.mockResolvedValue(report);

    await expect(
      ReportService.addReport("reporter-1", {
        reporter: "attacker-id",
        type: "abuse",
        description: "A report",
        targetType: "User",
        targetId: "target-user",
      }),
    ).resolves.toBe(report);

    expect(ReportModel.create).toHaveBeenCalledWith({
      reporter: "reporter-1",
      type: "abuse",
      description: "A report",
      targetType: "User",
      targetId: "target-user",
    });
  });

  it("rejects reports for missing targets", async () => {
    PostModel.exists.mockResolvedValue(null);

    await expect(
      ReportService.addReport("reporter-1", {
        type: "inappropriate",
        targetType: "Comment",
        targetId: "missing-comment",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(ReportModel.create).not.toHaveBeenCalled();
  });

  it("attributes status resolution to the authenticated admin", async () => {
    const report = { _id: "report-1", status: "closed" };
    ReportModel.findByIdAndUpdate.mockResolvedValue(report);

    await expect(
      ReportService.updateReportStatus("report-1", "closed", "admin-1"),
    ).resolves.toBe(report);
    expect(ReportModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "report-1",
      {
        $set: { status: "closed", resolvedBy: "admin-1" },
      },
      { new: true, runValidators: true },
    );
  });

  it("paginates report results and safely handles comment references", async () => {
    const report = {
      targetType: "Post",
      populate: jest.fn().mockResolvedValue(undefined),
    };
    ReportModel.countDocuments.mockResolvedValue(21);
    ReportModel.find.mockReturnValue(makeQuery([report]));

    const result = await ReportService.getReports({
      page: 2,
      limit: 10,
    });

    expect(ReportModel.find.mock.calls[0][0]).toEqual({});
    expect(result).toMatchObject({
      totalReports: 21,
      page: 2,
      limit: 10,
      pages: 3,
      reports: [report],
    });
  });
});

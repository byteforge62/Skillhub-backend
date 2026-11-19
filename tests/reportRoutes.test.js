const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const ReportService = require("../services/ReportService");
const reportRoutes = require("../routes/ReportRoutes");
const errorHandler = require("../middleware/errorHandler");

jest.mock("../services/ReportService", () => ({
  addReport: jest.fn(),
  getReports: jest.fn(),
  updateReportStatus: jest.fn(),
  getReportById: jest.fn(),
  deleteReport: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(reportRoutes);
app.use(errorHandler);

const userId = "507f1f77bcf86cd799439011";
const targetId = "507f1f77bcf86cd799439012";
const reportId = "507f1f77bcf86cd799439013";
const tokenFor = (role = "user") =>
  jwt.sign({ id: userId, role }, process.env.ACCESS_TOKEN_SECRET);

describe("report routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-report-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication and binds report ownership to the token", async () => {
    const unauthenticated = await request(app)
      .post("/report")
      .send({
        type: "abuse",
        targetType: "Post",
        targetId,
      });
    ReportService.addReport.mockResolvedValue({ _id: reportId });
    const authenticated = await request(app)
      .post("/report")
      .set("Authorization", `Bearer ${tokenFor()}`)
      .send({
        reporter: targetId,
        type: "abuse",
        description: "Report text",
        targetType: "Post",
        targetId,
      });

    expect(unauthenticated.status).toBe(401);
    expect(authenticated.status).toBe(201);
    expect(ReportService.addReport).toHaveBeenCalledWith(userId, {
      type: "abuse",
      description: "Report text",
      targetType: "Post",
      targetId,
    });
  });

  it("restricts report review to admins and derives the resolver identity", async () => {
    const forbidden = await request(app)
      .patch(`/reports/${reportId}`)
      .set("Authorization", `Bearer ${tokenFor()}`)
      .send({ status: "closed", resolvedBy: targetId });
    ReportService.updateReportStatus.mockResolvedValue({ _id: reportId });
    const allowed = await request(app)
      .patch(`/reports/${reportId}`)
      .set("Authorization", `Bearer ${tokenFor("admin")}`)
      .send({ status: "closed", resolvedBy: targetId });

    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(ReportService.updateReportStatus).toHaveBeenCalledWith(
      reportId,
      "closed",
      userId,
    );
  });
});

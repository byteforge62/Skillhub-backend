const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const AdminLogService = require("../services/AdminLogService");
const adminLogRoutes = require("../routes/AdminLogRoutes");
const errorHandler = require("../middleware/errorHandler");

jest.mock("../services/AdminLogService", () => ({
  addAdminLog: jest.fn(),
  getAdminLogs: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(adminLogRoutes);
app.use(errorHandler);

const adminId = "507f1f77bcf86cd799439011";
const tokenFor = (role) =>
  jwt.sign({ id: adminId, role }, process.env.ACCESS_TOKEN_SECRET);

describe("admin log routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-admin-log-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires an admin and derives the log actor from authentication", async () => {
    const userResponse = await request(app)
      .post("/adminlog")
      .set("Authorization", `Bearer ${tokenFor("user")}`)
      .send({ details: "Attempt" });
    AdminLogService.addAdminLog.mockResolvedValue({ _id: "log-1" });
    const adminResponse = await request(app)
      .post("/adminlog")
      .set("Authorization", `Bearer ${tokenFor("admin")}`)
      .send({
        adminId: "507f1f77bcf86cd799439099",
        action: "OTHER",
        details: "Reviewed a report",
      });

    expect(userResponse.status).toBe(403);
    expect(adminResponse.status).toBe(201);
    expect(AdminLogService.addAdminLog).toHaveBeenCalledWith(adminId, {
      action: "OTHER",
      details: "Reviewed a report",
    });
  });
});

const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const NotificationService = require("../services/NotificationService");
const AchievementService = require("../services/AchievementService");
const CertificateService = require("../services/CertificateService");
const notificationRoutes = require("../routes/NotificationRoutes");
const achievementRoutes = require("../routes/AchievementRoutes");
const certificateRoutes = require("../routes/CertificateRoutes");

jest.mock("../services/NotificationService", () => ({
  getNotificationsForUser: jest.fn(),
  markAsRead: jest.fn(),
}));
jest.mock("../services/AchievementService", () => ({
  createAchievement: jest.fn(),
  checkAchievement: jest.fn(),
  getUserAchievements: jest.fn(),
  getAchievements: jest.fn(),
}));
jest.mock("../services/CertificateService", () => ({
  addCertificate: jest.fn(),
  getCertificatesByUserId: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/notifications", notificationRoutes);
app.use("/achievements", achievementRoutes);
app.use("/certificates", certificateRoutes);

const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439012";
const token = (id = userId, role = "user") =>
  jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET);

describe("account-owned data authorization", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-account-data-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("restricts notification listing and marking as read to the owner", async () => {
    const forbiddenList = await request(app)
      .get(`/notifications/${otherUserId}`)
      .set("Authorization", `Bearer ${token()}`);
    expect(forbiddenList.status).toBe(403);
    expect(NotificationService.getNotificationsForUser).not.toHaveBeenCalled();

    NotificationService.markAsRead.mockResolvedValue({ _id: "notification-1" });
    const read = await request(app)
      .patch("/notifications/507f1f77bcf86cd799439013/read")
      .set("Authorization", `Bearer ${token()}`);
    expect(read.status).toBe(200);
    expect(NotificationService.markAsRead).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439013",
      userId,
    );
  });

  it("allows achievement checks only for the authenticated user", async () => {
    const forbidden = await request(app)
      .post(`/achievements/check/${otherUserId}`)
      .set("Authorization", `Bearer ${token()}`);
    expect(forbidden.status).toBe(403);
    expect(AchievementService.checkAchievement).not.toHaveBeenCalled();

    AchievementService.checkAchievement.mockResolvedValue({
      newlyUnlocked: [],
      achievements: [],
    });
    const own = await request(app)
      .post(`/achievements/check/${userId}`)
      .set("Authorization", `Bearer ${token()}`);
    expect(own.status).toBe(200);
    expect(AchievementService.checkAchievement).toHaveBeenCalledWith(userId);
  });

  it("restricts certificates to their owner unless the caller is an admin", async () => {
    const forbidden = await request(app)
      .get(`/certificates/certificates/${otherUserId}`)
      .set("Authorization", `Bearer ${token()}`);
    expect(forbidden.status).toBe(403);
    expect(CertificateService.getCertificatesByUserId).not.toHaveBeenCalled();

    CertificateService.getCertificatesByUserId.mockResolvedValue([]);
    const admin = await request(app)
      .get(`/certificates/certificates/${otherUserId}`)
      .set("Authorization", `Bearer ${token(userId, "admin")}`);
    expect(admin.status).toBe(200);
    expect(CertificateService.getCertificatesByUserId).toHaveBeenCalledWith(
      otherUserId,
    );
  });
});

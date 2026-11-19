const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const UserSettingsService = require("../services/UserSettingsService");
const settingsRoutes = require("../routes/UserSettingsRoutes");
const errorHandler = require("../middleware/errorHandler");

jest.mock("../services/UserSettingsService", () => ({
  getUserSettings: jest.fn(),
  updateUserSettings: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(settingsRoutes);
app.use(errorHandler);

const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439099";
const token = jwt.sign(
  { id: userId, role: "user" },
  process.env.ACCESS_TOKEN_SECRET || "test-settings-secret",
);

describe("user settings routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-settings-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication and rejects another user's settings", async () => {
    const unauthenticated = await request(app).get(
      `/user/${userId}/settings`,
    );
    const unauthorized = await request(app)
      .get(`/user/${otherUserId}/settings`)
      .set("Authorization", `Bearer ${token}`);

    expect(unauthenticated.status).toBe(401);
    expect(unauthorized.status).toBe(403);
    expect(UserSettingsService.getUserSettings).not.toHaveBeenCalled();
  });

  it("validates and whitelists setting updates", async () => {
    UserSettingsService.updateUserSettings.mockResolvedValue({
      theme: "light",
    });
    const response = await request(app)
      .put(`/user/${userId}/settings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ theme: "light", role: "admin" });

    expect(response.status).toBe(200);
    expect(UserSettingsService.updateUserSettings).toHaveBeenCalledWith(
      userId,
      { theme: "light" },
    );
  });
});

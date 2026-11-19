const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const UserService = require("../services/UserService");
const userRoutes = require("../routes/UserRoutes");
const errorHandler = require("../middleware/errorHandler");

jest.mock("../services/UserService", () => ({
  getUserById: jest.fn(),
  getAllUsers: jest.fn(),
  updateUser: jest.fn(),
  uploadAvatar: jest.fn(),
  deleteUser: jest.fn(),
  searchUsers: jest.fn(),
}));
jest.mock("../services/AuthService", () => ({}));

const app = express();
app.use(express.json());
app.use(userRoutes);
app.use(errorHandler);

const validId = "507f1f77bcf86cd799439011";
const authToken = (id = validId) =>
  jwt.sign({ id, role: "user" }, process.env.ACCESS_TOKEN_SECRET);

describe("user profile routes", () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-user-profile-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires authentication and valid profile input", async () => {
    const nonAdminUserList = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${authToken()}`);
    const unauthenticated = await request(app)
      .put(`/user/${validId}`)
      .send({ fullname: "Updated name" });
    const invalid = await request(app)
      .put(`/user/${validId}`)
      .set("Authorization", `Bearer ${authToken()}`)
      .send({ fullname: "x" });

    expect(unauthenticated.status).toBe(401);
    expect(nonAdminUserList.status).toBe(403);
    expect(invalid.status).toBe(400);
    expect(UserService.updateUser).not.toHaveBeenCalled();
  });

  it("validates the profile ID and strips privilege fields", async () => {
    UserService.updateUser.mockResolvedValue({ _id: validId });
    const invalidId = await request(app)
      .put("/user/not-an-id")
      .set("Authorization", `Bearer ${authToken()}`)
      .send({ fullname: "Updated" });
    const response = await request(app)
      .put(`/user/${validId}`)
      .set("Authorization", `Bearer ${authToken()}`)
      .send({ fullname: "Updated", role: "admin", points: 5000 });

    expect(invalidId.status).toBe(400);
    expect(response.status).toBe(200);
    expect(UserService.updateUser).toHaveBeenCalledWith(
      validId,
      { fullname: "Updated" },
      validId,
    );
  });

  it("requires authentication and an allowed image type for avatar upload", async () => {
    const unauthenticated = await request(app)
      .post("/user/me/avatar")
      .attach("avatar", Buffer.from("image"), {
        filename: "avatar.svg",
        contentType: "image/svg+xml",
      });
    const invalidType = await request(app)
      .post("/user/me/avatar")
      .set("Authorization", `Bearer ${authToken()}`)
      .attach("avatar", Buffer.from("image"), {
        filename: "avatar.svg",
        contentType: "image/svg+xml",
      });

    expect(unauthenticated.status).toBe(401);
    expect(invalidType.status).toBe(400);
    expect(UserService.uploadAvatar).not.toHaveBeenCalled();
  });
});
